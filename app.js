const freteData = [
  {
    resolucao: 'Portaria Nº 202',
    periodo: 'Valores médios',
    freteBase: 1184.33,
  },
  {
    resolucao: 'Resolução Nº 6.034',
    periodo: 'Jan-Fev 2024',
    freteBase: 1249.95,
  },
  {
    resolucao: 'Resolução Nº 6.034',
    periodo: 'Fev-Mar 2024',
    freteBase: 1315.18,
  },
];

const ICMS_RATE = 0.12;
const AD_VALOREM_RATE = 0.005;
const PEDAGIO_POR_KM = 0.18;
const DISTANCIA_KM = 280;

function formatCurrency(input) {
  let value = input.value.replace(/\D/g, '');
  value = (value / 100).toFixed(2);
  value = value.replace('.', ',');
  value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  input.value = value;
}

function formatNumber(input) {
  let value = input.value.replace(/\D/g, '');
  value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  input.value = value;
}

function parseCurrency(value) {
  return parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0;
}

function parseNumber(value) {
  return parseInt(value.replace(/\./g, '')) || 0;
}

function formatMoney(value) {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function calcularTaxas() {
  const valorCarga = parseCurrency(document.getElementById('valorCarga').value);
  const peso = parseNumber(document.getElementById('peso').value);
  const freteRetorno = document.querySelector('input[name="freteRetorno"]:checked').value === 'sim';

  const tbody = document.getElementById('calculatorBody');
  tbody.innerHTML = '';

  freteData.forEach((data) => {
    const icmsValue = data.freteBase * ICMS_RATE;
    const adValoremValue = valorCarga * AD_VALOREM_RATE;
    const pedagioValue = DISTANCIA_KM * PEDAGIO_POR_KM;

    let totalTaxas = icmsValue + adValoremValue + pedagioValue;
    let freteBaseCalc = data.freteBase;
    let totalFinal = freteBaseCalc + totalTaxas;

    if (freteRetorno) {
      totalTaxas *= 2;
      freteBaseCalc *= 2;
      totalFinal = freteBaseCalc + totalTaxas;
    }

    const labelSuffix = freteRetorno ? ' (Ida + Volta)' : '';
    const icmsLabel = freteRetorno ? `${formatMoney(icmsValue)} × 2` : formatMoney(icmsValue);
    const adValoremLabel = freteRetorno ? `${formatMoney(adValoremValue)} × 2` : formatMoney(adValoremValue);
    const pedagioLabel = freteRetorno ? `${formatMoney(pedagioValue)} × 2` : formatMoney(pedagioValue);

    tbody.innerHTML += `
        <tr>
          <td rowspan="${freteRetorno ? 6 : 4}" style="vertical-align: middle; font-weight: 600;">
            ${data.resolucao}<br><small class="tax-label">${data.periodo}</small>
          </td>
          <td>ICMS${labelSuffix}</td>
          <td>SC → PR</td>
          <td>12,00%</td>
          <td class="valor-monetario">${formatMoney(freteRetorno ? icmsValue * 2 : icmsValue)}</td>
          <td class="valor-monetario">${formatMoney(freteBaseCalc)}</td>
          <td class="valor-monetario" rowspan="${
            freteRetorno ? 6 : 4
          }" style="vertical-align: middle; font-size: 14px; font-weight: 600;">
            ${formatMoney(totalFinal)}
          </td>
        </tr>
      `;

    if (freteRetorno) {
      tbody.innerHTML += `
          <tr class="return-detail-row">
            <td>↳ Ida: ${formatMoney(icmsValue)} + Volta: ${formatMoney(icmsValue)}</td>
            <td colspan="3"></td>
            <td class="valor-monetario">-</td>
          </tr>
        `;
    }

    tbody.innerHTML += `
        <tr class="highlight-new">
          <td>Ad Valorem${labelSuffix}</td>
          <td>R$ ${formatMoney(valorCarga)}</td>
          <td>0,50%</td>
          <td class="valor-monetario">${formatMoney(freteRetorno ? adValoremValue * 2 : adValoremValue)}</td>
          <td class="valor-monetario">-</td>
        </tr>
      `;

    if (freteRetorno) {
      tbody.innerHTML += `
          <tr class="return-detail-row">
            <td>↳ Ida: ${formatMoney(adValoremValue)} + Volta: ${formatMoney(adValoremValue)}</td>
            <td colspan="3"></td>
            <td class="valor-monetario">-</td>
          </tr>
        `;
    }

    tbody.innerHTML += `
        <tr class="highlight-new">
          <td>Pedágio${labelSuffix}</td>
          <td>${DISTANCIA_KM} km<span class="distance-info">(rota padrão)</span></td>
          <td>R$ 0,18/km</td>
          <td class="valor-monetario">${formatMoney(freteRetorno ? pedagioValue * 2 : pedagioValue)}</td>
          <td class="valor-monetario">-</td>
        </tr>
      `;

    if (freteRetorno) {
      tbody.innerHTML += `
          <tr class="return-detail-row">
            <td>↳ Ida: ${formatMoney(pedagioValue)} + Volta: ${formatMoney(pedagioValue)}</td>
            <td colspan="3"></td>
            <td class="valor-monetario">-</td>
          </tr>
        `;
    }

    tbody.innerHTML += `
        <tr class="total-row">
          <td colspan="4"><strong>TOTAL DE TAXAS${labelSuffix}</strong></td>
          <td class="valor-monetario"><strong>${formatMoney(totalTaxas)}</strong></td>
          <td class="valor-monetario">-</td>
        </tr>
      `;
  });
}

document.addEventListener('DOMContentLoaded', function () {
  calcularTaxas();
});
