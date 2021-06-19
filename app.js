const currencyOneEl = document.querySelector('[data-js="currency-one"]')
const currencyTwoEl = document.querySelector('[data-js="currency-two"]')
const currenciesEl = document.querySelector('[data-js="currencies"]')
const convertedValueEl = document.querySelector('[data-js="converted-value"]')
const timesCurrencyEl = document.querySelector('[data-js="currency-one-times"]')
const conversionPrecisionEl = document
  .querySelector('[data-js="conversion-precision"]')

const APIKey = 'd4a23b1aefbbadff39a59d1a'

const getExchangeRateUrl = baseCurrency => 
  `https://v6.exchangerate-api.com/v6/${APIKey}/latest/${baseCurrency}`

const showAlert = err => {
  const div = document.createElement('div')
  const button = document.createElement('button')

  div.classList.add('alert', 'alert-warning', 'alert-dismissible', 'fade', 'show')
  button.classList.add('btn-close')

  div.setAttribute('role', 'alert')
  button.setAttribute('type', 'button')
  button.setAttribute('aria-label', 'Close')

  const removeAlert = () => div.remove()  
  button.addEventListener('click', removeAlert)

  div.textContent = err.message

  div.appendChild(button)
  currenciesEl.insertAdjacentElement('afterend', div)
}

const state = (() => {
  let exchangeRateData = {}

  return {
    getExchangeRateData: () => {
      return exchangeRateData
    },
    setExchangeRateData: newExchangeRateData => {
      if (!newExchangeRateData.conversion_rates) {
        showAlert('O objeto fornecido precisa ter uma propriedade "conversion_rates"')
        return
      }

      exchangeRateData = newExchangeRateData
      return exchangeRateData
    }
  }
})()

const getErrorMessage = type => ({ 
  'unsupported-code': 'Não existe suporte para o código de moeda fornecido.',
  'malformed-request': 'Alguma parte da sua solicitação não segue a estrutura mostrada acima.',
  'invalid-key': 'Sua chave API não é válida.',
  'inactive-account': 'Seu endereço de e-mail não foi confirmado.',
  'quota-reached': 'Sua conta atingiu o número de solicitações permitidas por seu plano.'
})[type]

const fetchExchangeRateData = async url => {
  try {
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error('Não foi possível obter os dados')
    }

    const exchangeRateData = await response.json()
   
    if (exchangeRateData.result === 'error') {
      throw new Error(getErrorMessage(exchangeRateData['error-type']))
    }

    return exchangeRateData
  } catch (err) {
    showAlert(err)
  }
}

const populateSelects = conversionRates => {
  const createOptions = selected => Object.keys(conversionRates)
    .map(currency => 
      `<option ${currency === selected ? 'selected' : ''}>${currency}</option>`)
    .join('')

  currencyOneEl.innerHTML = createOptions('USD')
  currencyTwoEl.innerHTML = createOptions('BRL')
}

const showConversionRateInfo = (conversionRates) => {
  const baseCurrency = currencyOneEl.value
  const targetCurrency = currencyTwoEl.value
  const convertedValue = conversionRates[targetCurrency]

  convertedValueEl.textContent = conversionRates[targetCurrency].toFixed(2)
  conversionPrecisionEl.textContent = `1 ${baseCurrency} = ${convertedValue} ${targetCurrency}`
}

const init = async () => {
  const url = getExchangeRateUrl('USD')
  const { conversion_rates } = state
    .setExchangeRateData(await fetchExchangeRateData(url))

  populateSelects(conversion_rates)
  showConversionRateInfo(conversion_rates)
}

const updateConversionRateValue = event => {
  const exchangeRateData = state.getExchangeRateData()
  const convertedValue = exchangeRateData.conversion_rates[currencyTwoEl.value]

  convertedValueEl.textContent = (event.target.valueAsNumber * convertedValue).toFixed(2)
}

const handleBaseCurrencyChange = async event => {
  const baseCurrencyValue = event.target.value
  const url = getExchangeRateUrl(baseCurrencyValue)
  const { conversion_rates } = state
    .setExchangeRateData(await fetchExchangeRateData(url))

  showConversionRateInfo(conversion_rates)
}

const handleTargetCurrencyChange = () => {
  const { conversion_rates } = state.getExchangeRateData()
  showConversionRateInfo(conversion_rates)
}

timesCurrencyEl.addEventListener('input', updateConversionRateValue)
currencyOneEl.addEventListener('input', handleBaseCurrencyChange)
currencyTwoEl.addEventListener('input', handleTargetCurrencyChange)

init()