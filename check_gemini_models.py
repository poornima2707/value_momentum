import google.generativeai as genai
import os

# Check if API key is set
api_key = os.getenv('GOOGLE_API_KEY') or "AIzaSyDqmfzCdnQDtYsmRHjPxq1sHZceY81x-2g"

print("Checking Gemini API setup...")
print(f"API Key configured: {'Yes' if api_key != 'YOUR_API_KEY' else 'No'}")

try:
    # Configure the API key
    genai.configure(api_key=api_key)

    # List available models
    print("\nAvailable models:")
    models = genai.list_models()
    for model in models:
        print(f"- {model.name}")

    # Test with a known working model
    print("\nTesting with gemini-2.0-flash...")
    model = genai.GenerativeModel('gemini-2.0-flash')
    response = model.generate_content("Say 'Hello, Gemini API is working!' in one sentence.")
    print(f"Response: {response.text}")

except Exception as e:
    print(f"Error: {e}")
    print("\nTroubleshooting steps:")
    print("1. Make sure you have a valid Google AI API key")
    print("2. Set it as GOOGLE_API_KEY environment variable or replace YOUR_API_KEY")
    print("3. Enable the Generative Language API in Google Cloud Console")
    print("4. Make sure your API key has the necessary permissions")
    print("5. Install the latest google-generativeai package: pip install google-generativeai")
