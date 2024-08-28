document.addEventListener('DOMContentLoaded', () => {
    const machinesContainer = document.getElementById('machines');
    const addMachineButton = document.getElementById('add-machine');
    const addToHistoryButton = document.getElementById('add-to-history');
    const clearAllButton = document.getElementById('clear-all');
    const exportDataButton = document.getElementById('export-data');
    const registerEquipmentButton = document.getElementById('register-equipment');
    const generateReportButton = document.getElementById('generate-report');
    const equipmentRegistrationContainer = document.getElementById('equipment-registration');
    const saveEquipmentButton = document.getElementById('save-equipment');
    const backToCalculatorButton = document.getElementById('back-to-calculator');
    const equipmentList = document.getElementById('equipment-list-items');
    const historyList = document.getElementById('history-list');
    const carbonEmissionValue = document.getElementById('carbon-emission-value');
    const reportContainer = document.getElementById('report');
    const reportConsumption = document.getElementById('report-consumption');
    const reportStatus = document.getElementById('report-status');
    const reportEmission = document.getElementById('report-emission');
    const reportRisks = document.getElementById('report-risks');
    const reportTips = document.getElementById('report-tips');
    const reportConclusion = document.getElementById('report-conclusion');
    const idealKwh = 150000; // 150 MWh em kWh
    const alertKwh = 150000; // 150 MWh em kWh
    const emissionFactor = 0.5; // kg CO2/kWh
    let machineCount = 0;
    const maxMachines = 10;
    const maxDays = 30;
    let historyData = [];
    let equipmentData = [];

    addMachineButton.addEventListener('click', () => {
        if (machineCount < maxMachines) {
            machineCount++;
            const machineDiv = document.createElement('div');
            machineDiv.className = 'machine';
            machineDiv.innerHTML = `
                <select class="machine-select">
                    ${equipmentData.map(equipment => `<option value="${equipment.consumption}">${equipment.name}</option>`).join('')}
                </select>
                <input type="number" placeholder="Horas de uso" class="machine-hours">
                <button class="remove-machine">Remover</button>
            `;
            machinesContainer.appendChild(machineDiv);

            machineDiv.querySelector('.remove-machine').addEventListener('click', () => {
                machinesContainer.removeChild(machineDiv);
                machineCount--;
            });
        } else {
            alert('Máximo de 10 máquinas atingido.');
        }
    });

    addToHistoryButton.addEventListener('click', () => {
        const machineSelects = document.querySelectorAll('.machine-select');
        const machineHours = document.querySelectorAll('.machine-hours');
        let totalConsumption = 0;
        machineSelects.forEach((select, index) => {
            const hours = parseFloat(machineHours[index].value) || 0;
            totalConsumption += (parseFloat(select.value) || 0) * hours;
        });

        const totalEmission = totalConsumption * emissionFactor;
        const day = historyData.length + 1;
        const historyItem = document.createElement('li');
        historyItem.textContent = `Dia ${day}: Consumo total: ${totalConsumption} kWh, Emissão de CO2: ${totalEmission.toFixed(2)} kg`;
        historyList.appendChild(historyItem);

        historyData.push({ day, totalConsumption, totalEmission });
        if (historyData.length > maxDays) {
            historyData.shift();
        }

        updateConsumptionColor();
        carbonEmissionValue.textContent = `Emissão total de CO2: ${totalEmission.toFixed(2)} kg`;
    });

    clearAllButton.addEventListener('click', () => {
        machinesContainer.innerHTML = '';
        machineCount = 0;
    });

    exportDataButton.addEventListener('click', () => {
        const worksheet = XLSX.utils.aoa_to_sheet([['Dia', 'Consumo Total (kWh)', 'Emissão de CO2 (kg)'], ...historyData.map(data => [data.day, data.totalConsumption, data.totalEmission.toFixed(2)])]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Histórico de Consumo');
        XLSX.writeFile(workbook, 'historico_consumo.xlsx');
    });

    registerEquipmentButton.addEventListener('click', () => {
        document.querySelector('.container').style.display = 'none';
        equipmentRegistrationContainer.style.display = 'block';
    });

    saveEquipmentButton.addEventListener('click', () => {
        const equipmentName = document.getElementById('equipment-name').value;
        const equipmentConsumption = document.getElementById('equipment-consumption').value;
        if (equipmentName && equipmentConsumption) {
            equipmentData.push({ name: equipmentName, consumption: equipmentConsumption });
            updateEquipmentList();
            document.getElementById('equipment-name').value = '';
            document.getElementById('equipment-consumption').value = '';
        } else {
            alert('Por favor, preencha todos os campos.');
        }
    });

    backToCalculatorButton.addEventListener('click', () => {
        document.querySelector('.container').style.display = 'block';
        equipmentRegistrationContainer.style.display = 'none';
    });

    generateReportButton.addEventListener('click', () => {
        const totalConsumption = historyData.reduce((sum, record) => sum + record.totalConsumption, 0);
        const totalEmission = totalConsumption * emissionFactor;
        const status = totalConsumption > alertKwh ? 'Alerta - Consumo Elevado' : 'Ideal';
        const risks = totalConsumption > alertKwh ? 'Riscos de aumento de custos e impacto ambiental elevado.' : 'Consumo dentro do esperado.';
        const tips = totalConsumption > alertKwh ? 'Reduza o uso de máquinas durante horários de pico, invista em equipamentos mais eficientes.' : 'Mantenha as boas práticas de consumo.';
        const conclusion = totalConsumption > alertKwh ? 'O consumo está acima do ideal. É necessário tomar medidas para reduzir o consumo.' : 'O consumo está dentro do ideal. Continue monitorando regularmente.';

        reportConsumption.textContent = `Consumo total: ${totalConsumption} kWh (${(totalConsumption / 1000).toFixed(2)} MWh)`;
        reportStatus.textContent = `Status: ${status}`;
        reportEmission.textContent = `Emissão total de CO2: ${totalEmission.toFixed(2)} kg`;
        reportRisks.textContent = `Riscos: ${risks}`;
        reportTips.textContent = `Dicas de Planejamento/Plano de Ação: ${tips}`;
        reportConclusion.textContent = `Considerações Finais: ${conclusion}`;

        reportContainer.style.display = 'block';

        // Gerar PDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFontSize(16);
        doc.text('Relatório de Consumo Energético - Calculadora de Consumo Energético', 10, 10);
        doc.setFontSize(12);
        doc.text('Prezado Usuário,', 10, 20);
        doc.text('Este é o seu relatório mensal gerado pela Calculadora de Consumo Energético. Nosso objetivo é ajudá-lo a monitorar e gerenciar o consumo de energia de suas máquinas e equipamentos, promovendo a eficiência energética e a sustentabilidade.', 10, 30, { maxWidth: 190 });
        doc.text(`Consumo Mensal: ${(totalConsumption / 1000).toFixed(2)} MWh`, 10, 50);
        doc.text(`Status: ${status}`, 10, 60);
        doc.text('Eficiência Energética e Sustentabilidade', 10, 70);
        doc.text('O consumo de energia é um dos principais fatores que impactam diretamente nossos custos operacionais e o meio ambiente. A eficiência energética é crucial para reduzir esses custos e minimizar a pegada de carbono.', 10, 80, { maxWidth: 190 });
        doc.text('Dicas para Melhorar a Eficiência Energética', 10, 100);
        doc.text('Manutenção Regular: Realize manutenções periódicas nos equipamentos para garantir que estejam funcionando de maneira eficiente.', 10, 110, { maxWidth: 190 });
        doc.text('Substituição de Equipamentos: Considere substituir máquinas antigas por modelos mais eficientes energeticamente.', 10, 120, { maxWidth: 190 });
        doc.text('Automatização e Controle: Utilize sistemas de automação para monitorar e controlar o uso de energia, evitando desperdícios.', 10, 130, { maxWidth: 190 });
        doc.text('Educação e Treinamento: Treine sua equipe para utilizar os equipamentos de forma consciente e eficiente.', 10, 140, { maxWidth: 190 });
        doc.text('Alertas e Perigos do Alto Consumo de Energia', 10, 160);
        doc.text('Um consumo mensal superior a 150 MWh pode representar riscos significativos:', 10, 170, { maxWidth: 190 });
        doc.text('Custos Elevados: O aumento no consumo de energia pode resultar em contas de eletricidade substancialmente mais altas, impactando negativamente o orçamento da sua empresa.', 10, 180, { maxWidth: 190 });
        doc.text('Emissão de Carbono: O alto consumo de energia está diretamente relacionado à maior emissão de gases de efeito estufa, contribuindo para as mudanças climáticas e o aquecimento global.', 10, 190, { maxWidth: 190 });
        doc.text('Desgaste dos Equipamentos: Equipamentos submetidos a altos níveis de uso podem sofrer desgaste mais rapidamente, levando a custos adicionais de manutenção e substituição.', 10, 200, { maxWidth: 190 });
        doc.text('Ações Recomendadas', 10, 220);
        doc.text('Auditoria Energética: Realize uma auditoria energética para identificar áreas onde o consumo pode ser reduzido.', 10, 230, { maxWidth: 190 });
        doc.text('Investimento em Energias Renováveis: Considere investir em fontes de energia renovável, como painéis solares, para reduzir a dependência de fontes não renováveis.', 10, 240, { maxWidth: 190 });
        doc.text('Implementação de Programas de Eficiência: Desenvolva e implemente programas de eficiência energética, estabelecendo metas claras para a redução do consumo.', 10, 250, { maxWidth: 190 });
        doc.text('Monitoramento Contínuo: Continue utilizando a Calculadora de Consumo Energético para monitorar e analisar o consumo de energia regularmente, permitindo ajustes rápidos e eficientes.', 10, 260, { maxWidth: 190 });
        doc.text('Conclusão', 10, 280);
        doc.text('A eficiência energética não só reduz custos operacionais, mas também é uma responsabilidade ambiental crucial. Ao adotar práticas mais sustentáveis e monitorar continuamente o consumo de energia, podemos contribuir para um futuro mais verde e sustentável.', 10, 290, { maxWidth: 190 });
        doc.text('Se precisar de mais assistência ou tiver alguma dúvida, não hesite em nos contatar.', 10, 300, { maxWidth: 190 });
        doc.text('Atenciosamente,', 10, 310);
        doc.text('Equipe Calculadora de Consumo Energético', 10, 320);

        doc.save('relatorio_mensal.pdf');
    });

    const updateEquipmentList = () => {
        equipmentList.innerHTML = '';
        equipmentData.forEach(equipment => {
            const listItem = document.createElement('li');
            listItem.textContent = `${equipment.name} - ${equipment.consumption} kWh`;
            equipmentList.appendChild(listItem);
        });
    };

    const updateConsumptionColor = () => {
        const totalConsumption = historyData.reduce((sum, record) => sum + record.totalConsumption, 0);
        const totalConsumptionElement = document.getElementById('total-consumption');
        if (!totalConsumptionElement) {
            const newElement = document.createElement('div');
            newElement.id = 'total-consumption';
            newElement.textContent = `Consumo total: ${totalConsumption} kWh`;
            document.body.appendChild(newElement);
        } else {
            totalConsumptionElement.textContent = `Consumo total: ${totalConsumption} kWh`;
        }

        if (totalConsumption > alertKwh) {
            totalConsumptionElement.style.color = 'red';
        } else {
            totalConsumptionElement.style.color = 'green';
        }
    };
});
