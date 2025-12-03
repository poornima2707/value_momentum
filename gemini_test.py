import google.generativeai as genai

# Configure the API key
genai.configure(api_key="AIzaSyDqmfzCdnQDtYsmRHjPxq1sHZceY81x-2g")

# List available models first
print("Available models:")
models = genai.list_models()
for model in models:
    print(f"- {model.name}")

# Use a known working model
print("\nTesting with gemini-1.5-flash...")
model = genai.GenerativeModel('gemini-1.5-flash')

response = model.generate_content("Explain how AI works in a few words")

print(f"Response: {response.text}")
