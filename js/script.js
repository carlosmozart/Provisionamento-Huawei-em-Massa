document.addEventListener('DOMContentLoaded', function () {
    // Função que será chamada quando o formulário for enviado
    document.querySelector('#ordemServico').addEventListener('submit', enviarTextos);

    function enviarTextos(event) {
        // Evitar o comportamento padrão do formulário (recarregar a página)
        event.preventDefault();

        // Pegando os valores do formulário
        const ramo = document.querySelector('#ramo').value;
        const vlan = document.querySelector('#vlan').value;
        const placa = document.querySelector('#placa').value;
        const json = document.querySelector('#json').value;

        // Limpar resultados antes de adicionar novos
        const resultados = document.querySelector('#resultados');
        resultados.innerHTML = '';

        // Exibir o JSON para depuração
        console.log('JSON Recebido:', json);

        // Tentar fazer o parse do JSON
        let parsedData;
        try {
            parsedData = JSON.parse(json);
            console.log('Dados JSON processados:', parsedData); // Verificação do JSON parse
        } catch (error) {
            alert('Erro ao processar o JSON. Certifique-se de que o formato está correto.');
            console.error('Erro ao processar JSON:', error);
            return;
        }

        // Processar cada item do JSON
        parsedData.forEach(item => {
            const nome = item.name;
            const serial = item["serial-number"];
            const lineProfile = item["line-profile"];

            console.log(`Processando ONU: ${nome}, serial: ${serial}, line-profile: ${lineProfile}`);

            // Criar lista de comandos com base no profile de linha
            let comandos = [];

            // Verificar se lineProfile contém 'BRIDGE' ou valores relacionados ao modo ROUTER
            if (lineProfile && lineProfile.toUpperCase().includes('BRIDGE')) {
                comandos = [
                    `conf`,
                    `interface gpon ${placa}`,
                    `ont add ${ramo} sn-auth ${serial} omci ont-lineprofile-id 2440 ont-srvprofile-id 2440 desc "${nome}"`,
                    `ont port native-vlan ${ramo} eth 1 vlan ${vlan} priority 0`,
                    `ont tr069-server-config ${ramo} profile-id 30`,
                    `quit`,
                    `service-port vlan 111 gpon ${placa}/${ramo} ont gemport 126 multi-service user-vlan 111 tag-transform translate`,
                    `service-port vlan ${vlan} gpon ${placa}/${ramo} ont gemport 126 multi-service user-vlan ${vlan} tag-transform translate`
                ];
            } else if (lineProfile && (lineProfile.toUpperCase().includes('ROUTER') || 
                                      lineProfile.toUpperCase().includes('HUAWEI') || 
                                      lineProfile.toUpperCase().includes('TEMP') || 
                                      lineProfile.toUpperCase().includes('TEMP-ROUTER'))) {
                comandos = [
                    `conf`,
                    `interface gpon ${placa}`,
                    `ont add ${ramo} sn-auth ${serial} omci ont-lineprofile-id 2440 ont-srvprofile-id 2440 desc "${nome}"`,
                    `ont ipconfig ${ramo} ip-index 1 dhcp vlan 111 priority 5`,
                    `ont tr069-server-config ${ramo} profile-id 30`,
                    `quit`,
                    `service-port vlan ${vlan} gpon ${placa}/${ramo} ont gemport 126 multi-service user-vlan ${vlan} tag-transform translate`,
                    `service-port vlan 111 gpon ${placa}/${ramo} ont gemport 126 multi-service user-vlan 111 tag-transform translate`
                ];
            }

            // Exibir os comandos no campo de resultados
            comandos.forEach(comando => {
                const li = document.createElement('li');
                li.textContent = comando; // Define o texto do comando
                resultados.appendChild(li); // Adiciona o comando à lista
            });
        });
    }
});

  /*  limparCampos() {
        const campos = ['placa', 'ramo', 'vlan', 'json'];
        campos.forEach(id => {
            this.formulario.querySelector(`#${id}`).value = '';
        });
    }*/

  /*  copiarParaAreaDeTransferencia(){
        const listaTexto = Array.from(this.resultados.querySelectorAll("li")).map(item => item.textContent).join("\n");
        const textarea = document.createElement("textarea");
        textarea.value = listaTexto;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        alert("Lista copiada para a área de transferência!");
    }*/


/*window.addEventListener('load', () => {
    const minhaInstancia = new GetValores();
});*/

// Alterna o modo escuro
document.getElementById('toggleDarkMode').addEventListener('click', function () {
    document.body.classList.toggle('dark-mode');
    document.querySelectorAll('.container, .label, .box, .descricao, .geo, .button')
        .forEach(element => element.classList.toggle('dark-mode'));

    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
});
