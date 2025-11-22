// Test script to find working Gemini models
require('dotenv').config()
const { GoogleGenerativeAI } = require('@google/generative-ai')

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY)

const modelsToTest = [
  'gemini-pro',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'models/gemini-pro',
  'models/gemini-1.5-flash',
]

async function testModel(modelName) {
  try {
    const model = genAI.getGenerativeModel({ model: modelName })
    const result = await model.generateContent('Say "test" if you can read this.')
    const response = await result.response
    console.log(`✅ ${modelName}: Works! Response: ${response.text().substring(0, 50)}`)
    return true
  } catch (error) {
    console.log(`❌ ${modelName}: ${error.message.substring(0, 100)}`)
    return false
  }
}

async function main() {
  console.log('Testing Gemini models...\n')
  
  for (const modelName of modelsToTest) {
    await testModel(modelName)
    await new Promise(resolve => setTimeout(resolve, 500)) // Rate limiting
  }
  
  console.log('\n✅ Test complete!')
}

main().catch(console.error)

