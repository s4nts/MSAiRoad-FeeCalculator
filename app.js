document.addEventListener('DOMContentLoaded', () => {
  const freteData = [
    { resolucao: 'Portaria Nº 202', periodo: 'Valores médios', freteBase: 1184.33 },
    { resolucao: 'Resolução Nº 6.034', periodo: 'Jan-Fev 2024', freteBase: 1249.95 },
    { resolucao: 'Resolução Nº 6.034', periodo: 'Fev-Mar 2024', freteBase: 1315.18 },
  ];
  const ICMS_RATE = 0.12;
  const AD_VALOREM_RATE = 0.005;
  const PEDAGIO_POR_KM = 0.18;
  const DISTANCIA_KM = 280;

  const valorCargaInput = document.getElementById('valorCarga');
  const pesoInput = document.getElementById('peso');
  const tipoCargaSelect = document.getElementById('tipoCarga');
  const eixoCaminhaoSelect = document.getElementById('eixoCaminhao');
  const calculateBtn = document.getElementById('calculateBtn');
  const tbody = document.getElementById('calculatorBody');
  const valorCargaError = document.getElementById('valorCargaError');
  const pesoError = document.getElementById('pesoError');

  function formatCurrency(input) {
    let value = input.value.replace(/\D/g, '');
    if (value) {
      value = (parseFloat(value) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      input.value = value;
    }
  }

  function formatNumber(input) {
    let value = input.value.replace(/\D/g, '');
    input.value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function parseCurrency(value) {
    return parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0;
  }

  function formatMoney(value) {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function validateAndToggleButton() {
    let isFormValid = true;

    if (!valorCargaInput.value.trim()) {
      valorCargaError.textContent = 'O valor da carga é obrigatório.';
      isFormValid = false;
    } else {
      valorCargaError.textContent = '';
    }

    if (!pesoInput.value.trim()) {
      pesoError.textContent = 'O peso é obrigatório.';
      isFormValid = false;
    } else {
      pesoError.textContent = '';
    }

    calculateBtn.disabled = !isFormValid;
  }

  function calcularTaxas() {
    validateAndToggleButton();
    if (calculateBtn.disabled) {
      return;
    }

    const valorCarga = parseCurrency(valorCargaInput.value);
    const freteRetorno = document.querySelector('input[name="freteRetorno"]:checked').value === 'sim';
    const tipoCarga = tipoCargaSelect.value;
    const eixo = eixoCaminhaoSelect.options[eixoCaminhaoSelect.selectedIndex].text;

    tbody.innerHTML = '';
    const fragment = document.createDocumentFragment();

    freteData.forEach((data) => {
      const pedagioValue = DISTANCIA_KM * PEDAGIO_POR_KM;
      const adValoremValue = valorCarga * AD_VALOREM_RATE;
      const icmsValue = data.freteBase * ICMS_RATE;

      let freteBaseCalc = data.freteBase;
      let totalTaxas = icmsValue + adValoremValue + pedagioValue;

      if (freteRetorno) {
        totalTaxas *= 2;
        freteBaseCalc *= 2;
      }
      const totalFinal = freteBaseCalc + totalTaxas;

      const rowspan = 4;
      const firstRow = createRow([
        { content: `${data.resolucao}<br><small class="tax-label">${data.periodo}</small>`, rowspan },
        { content: tipoCarga, rowspan },
        { content: eixo, rowspan },
        { content: 'ICMS' },
        { content: `Frete Base (R$ ${formatMoney(data.freteBase)})` },
        { content: `${(ICMS_RATE * 100).toFixed(2)}%` },
        { content: formatMoney(freteRetorno ? icmsValue * 2 : icmsValue), class: 'valor-monetario' },
        { content: formatMoney(freteBaseCalc), class: 'valor-monetario', rowspan },
        {
          content: formatMoney(totalFinal),
          class: 'valor-monetario',
          rowspan,
          style: 'font-size: 14px; font-weight: 600;',
        },
      ]);

      const adValoremRow = createRow([
        { content: 'Ad Valorem' },
        { content: `Valor da Carga (R$ ${formatMoney(valorCarga)})` },
        { content: `${(AD_VALOREM_RATE * 100).toFixed(2)}%` },
        { content: formatMoney(freteRetorno ? adValoremValue * 2 : adValoremValue), class: 'valor-monetario' },
      ]);

      const pedagioRow = createRow([
        { content: 'Pedágio' },
        { content: `${DISTANCIA_KM} km` },
        { content: `R$ ${PEDAGIO_POR_KM.toFixed(2)}/km` },
        { content: formatMoney(freteRetorno ? pedagioValue * 2 : pedagioValue), class: 'valor-monetario' },
      ]);

      const totalRow = createRow([
        {
          content: `<strong>TOTAL DE TAXAS ${freteRetorno ? '(Ida + Volta)' : ''}</strong>`,
          colspan: 6,
          class: 'total-row',
        },
        { content: `<strong>${formatMoney(totalTaxas)}</strong>`, class: 'valor-monetario total-row' },
      ]);

      fragment.appendChild(firstRow);
      fragment.appendChild(adValoremRow);
      fragment.appendChild(pedagioRow);
      fragment.appendChild(totalRow);
    });

    tbody.appendChild(fragment);
  }

  function createRow(cells) {
    const row = document.createElement('tr');
    cells.forEach((cellData) => {
      const cell = document.createElement(cellData.header ? 'th' : 'td');
      if (cellData.colspan) cell.colSpan = cellData.colspan;
      if (cellData.rowspan) cell.rowSpan = cellData.rowspan;
      if (cellData.class) cell.className = cellData.class;
      if (cellData.style) cell.style.cssText = cellData.style;
      cell.innerHTML = cellData.content;
      row.appendChild(cell);
    });
    return row;
  }

  calculateBtn.addEventListener('click', calcularTaxas);

  valorCargaInput.addEventListener('blur', () => formatCurrency(valorCargaInput));
  pesoInput.addEventListener('blur', () => formatNumber(pesoInput));
  [valorCargaInput, pesoInput].forEach((input) => {
    input.addEventListener('input', validateAndToggleButton);
  });

  validateAndToggleButton();
  calcularTaxas();
});
