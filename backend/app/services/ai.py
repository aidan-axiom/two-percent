"""Recipe suggestions from either Gemini or Claude, behind one interface."""

import anthropic
from google import genai
from google.genai import errors as genai_errors

from app.schemas import RecipeSuggestions

PROVIDERS = ("gemini", "claude")

SYSTEM = (
    "You are a practical home-cooking assistant. Suggest 3-5 realistic recipes "
    "that maximize use of the ingredients on hand. Assume basic pantry staples "
    "(salt, pepper, oil, water) are available. Keep missing_ingredients short "
    "and cheap where possible."
)


class ProviderError(Exception):
    """A provider API call failed; message is safe to show to the user."""


def _build_prompt(ingredients: list[str]) -> str:
    inventory = "\n".join(f"- {item}" for item in ingredients)
    return (
        f"Here is what's in my kitchen:\n{inventory}\n\n"
        "Suggest recipes I can make."
    )


def _suggest_claude(api_key: str, ingredients: list[str]) -> RecipeSuggestions:
    client = anthropic.Anthropic(api_key=api_key)
    try:
        response = client.messages.parse(
            model="claude-opus-4-8",
            max_tokens=16000,
            system=SYSTEM,
            thinking={"type": "adaptive"},
            output_config={"effort": "medium"},
            messages=[{"role": "user", "content": _build_prompt(ingredients)}],
            output_format=RecipeSuggestions,
        )
    except anthropic.APIStatusError as e:
        message = (
            e.body.get("error", {}).get("message", str(e))
            if isinstance(e.body, dict)
            else str(e)
        )
        raise ProviderError(message)
    except anthropic.APIError as e:
        raise ProviderError(f"Claude API unavailable ({e.__class__.__name__})")
    return response.parsed_output


def _suggest_gemini(api_key: str, ingredients: list[str]) -> RecipeSuggestions:
    client = genai.Client(api_key=api_key)
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=_build_prompt(ingredients),
            config={
                "system_instruction": SYSTEM,
                "response_mime_type": "application/json",
                "response_schema": RecipeSuggestions,
            },
        )
    except genai_errors.APIError as e:
        raise ProviderError(e.message or f"Gemini API error ({e.code})")
    parsed = response.parsed
    if not isinstance(parsed, RecipeSuggestions):
        raise ProviderError("Gemini returned an unexpected response format")
    return parsed


def get_recipe_suggestions(
    provider: str, api_key: str, ingredients: list[str]
) -> RecipeSuggestions:
    if provider == "gemini":
        return _suggest_gemini(api_key, ingredients)
    if provider == "claude":
        return _suggest_claude(api_key, ingredients)
    raise ProviderError(f"Unknown provider '{provider}'")
