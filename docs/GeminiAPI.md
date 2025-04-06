Gemini 2.5 Pro Experimental, our most advanced model, is now available! Learn more
Home
Gemini API
Models
Was this helpful?

Send feedbackGenerate images

The Gemini API supports image generation using Gemini 2.0 Flash Experimental and using Imagen 3. This guide helps you get started with both models.

Before you begin
Before calling the Gemini API, ensure you have your SDK of choice installed, and a Gemini API key configured and ready to use.

Generate images using Gemini
Gemini 2.0 Flash Experimental supports the ability to output text and inline images. This lets you use Gemini to conversationally edit images or generate outputs with interwoven text (for example, generating a blog post with text and images in a single turn). All generated images include a SynthID watermark, and images in Google AI Studio include a visible watermark as well.

Note: Make sure to include responseModalities: ["Text", "Image"] in your generation configuration for text and image output with gemini-2.0-flash-exp-image-generation. Image only is not allowed.
The following example shows how to use Gemini 2.0 to generate text-and-image output:

Python
JavaScript
REST

from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO
import base64

client = genai.Client()

contents = ('Hi, can you create a 3d rendered image of a pig '
            'with wings and a top hat flying over a happy '
            'futuristic scifi city with lots of greenery?')

response = client.models.generate_content(
    model="gemini-2.0-flash-exp-image-generation",
    contents=contents,
    config=types.GenerateContentConfig(
      response_modalities=['Text', 'Image']
    )
)

for part in response.candidates[0].content.parts:
  if part.text is not None:
    print(part.text)
  elif part.inline_data is not None:
    image = Image.open(BytesIO((part.inline_data.data)))
    image.save('gemini-native-image.png')
    image.show()
AI-generated image of a fantastical flying pig
AI-generated image of a fantastical flying pig
Depending on the prompt and context, Gemini will generate content in different modes (text to image, text to image and text, etc.). Here are some examples:

Text to image
Example prompt: "Generate an image of the Eiffel tower with fireworks in the background."
Text to image(s) and text (interleaved)
Example prompt: "Generate an illustrated recipe for a paella."
Image(s) and text to image(s) and text (interleaved)
Example prompt: (With an image of a furnished room) "What other color sofas would work in my space? can you update the image?"
Image editing (text and image to image)
Example prompt: "Edit this image to make it look like a cartoon"
Example prompt: [image of a cat] + [image of a pillow] + "Create a cross stitch of my cat on this pillow."
Multi-turn image editing (chat)
Example prompts: [upload an image of a blue car.] "Turn this car into a convertible." "Now change the color to yellow."
Image editing with Gemini
To perform image editing, add an image as input. The following example demonstrats uploading base64 encoded images. For multiple images and larger payloads, check the image input section.

Python
JavaScript
REST

from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO

import PIL.Image

image = PIL.Image.open('/path/to/image.png')

client = genai.Client()

text_input = ('Hi, This is a picture of me.'
            'Can you add a llama next to me?',)

response = client.models.generate_content(
    model="gemini-2.0-flash-exp-image-generation",
    contents=[text_input, image],
    config=types.GenerateContentConfig(
      response_modalities=['Text', 'Image']
    )
)

for part in response.candidates[0].content.parts:
  if part.text is not None:
    print(part.text)
  elif part.inline_data is not None:
    image = Image.open(BytesIO(part.inline_data.data))
    image.show()


Limitations
For best performance, use the following languages: EN, es-MX, ja-JP, zh-CN, hi-IN.
Image generation does not support audio or video inputs.
Image generation may not always trigger:
The model may output text only. Try asking for image outputs explicitly (e.g. "generate an image", "provide images as you go along", "update the image").
The model may stop generating partway through. Try again or try a different prompt.
When generating text for an image, Gemini works best if you first generate the text and then ask for an image with the text.