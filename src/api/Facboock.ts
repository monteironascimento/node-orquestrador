import axios from 'axios';
import { tipoServicoEnum } from '../enum/TipoServicoEnum';
import { endPointDesEnum , endPointProdEnum} from '../enum/EndPointEnum';
import { removeAcentoNormal } from '../tools/NormalizarString';
import { isEmpty } from '../tools/Empty';

const endPoint = (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test' ? endPointProdEnum : endPointDesEnum)

export const ExecFacboock = async (objConta: any) => {

  try {
 
    console.log(`Executou rotina ${tipoServicoEnum.FACBOOCK.toString()}`)
    let listaOfertas: any[] = [];

    const url = `${endPoint.urlServidorDatabase}/findPenpDivulgacao`
    objConta.username = 'https://www.facebook.com/ofertabestt'
    objConta.tipoServiceDestino = tipoServicoEnum.FACBOOCK
    
    let objCategoriasPrincipal: any[] = [];
    objCategoriasPrincipal.push(46) // Games e PC Gamer
    objCategoriasPrincipal.push(48) // Casa
    objCategoriasPrincipal.push(48) // Casa
    objCategoriasPrincipal.push(50) // Moda Feminia
    objCategoriasPrincipal.push(65) // Animais
    objCategoriasPrincipal.push(45) // Eletrônicos
    objCategoriasPrincipal.push(45) // Eletrônicos
    objCategoriasPrincipal.push(45) // Eletrônicos
    objCategoriasPrincipal.push(51) // Moda Masculina
    objCategoriasPrincipal.push(52) // Moda Infantil
    objCategoriasPrincipal.push(54) // Infantil e Criança
    objCategoriasPrincipal.push(56) // Ferramentas e Jardim
    objCategoriasPrincipal.push(58) // Esportes e Exercícios
    objCategoriasPrincipal.push(61) // Livros, Filmes e Música

    let objPostagem: any = await axios.post(url, objConta,{
      params: {
        limit: 10,
        offset: 0,
        listCatPai: `${objCategoriasPrincipal[Math.floor(Math.random() * objCategoriasPrincipal.length)]}`
      }  
    })

    if(isEmpty(objPostagem.data)){
      objPostagem = await axios.post(url, objConta,{
        params: {
          limit: 10,
          offset: 0,
          listCatPai: `${objCategoriasPrincipal[Math.floor(Math.random() * objCategoriasPrincipal.length)]}`
        }  
      })
    }

    if(isEmpty(objPostagem.data)){
      objPostagem = await axios.post(url, objConta,{
        params: {
          limit: 10,
          offset: 0,
          listCatPai: `${objCategoriasPrincipal[Math.floor(Math.random() * objCategoriasPrincipal.length)]}`
        }  
      })
    }

    if(isEmpty(objPostagem.data)){
      return "Nenhuma oferta encontrada para divulgação";
    }
    
    let obj = objPostagem.data[Math.floor(Math.random() * objPostagem.data.length)]
    obj.descricao =  removeAcentoNormal(`${obj.tipoorigem === 'C' ? 
                      `Cupon ${obj.descricao}${String.fromCharCode(13)}${String.fromCharCode(13)}`: 
                      `${obj.descricao}${String.fromCharCode(13)}${String.fromCharCode(13)}${(obj.precototal > obj.preco ? `De: ${obj.precototal}   ` : '')}Por: ${obj.preco}${String.fromCharCode(13)}${String.fromCharCode(13)}`}`),
    listaOfertas.push({ 
      description: obj.descricao,
      link: obj.link,
    }) 

    if(isEmpty(listaOfertas)){
      return "Nenhuma oferta encontrada para divulgação";
    }
    
    await axios({
      method: 'post',
      url: `${endPoint.urlServidorFacboock}/postGroupFacboock`,
      data: {
              listaOfertas: listaOfertas
            }
    })
      
    efetivarProcessado(objConta, obj)

  } catch (error) {
    console.log(error)
  }
  
  return "OK";
}

async function efetivarProcessado (objConta: any, objDados: any){

    const objPost = {
      idPlataformaContaProcessado: objDados.idPlataformaContaProcessado,
      idPlataforma : objConta.idPlataforma,
      idPlataformaConta: objConta.idPlataformaConta,
      idProcessamentoOrigem: objDados.idSincronizacao,
      idSincronizacao: objConta.idSincronizacao,
      tipoServico: objDados.tipoServico,
      tipoInformacao: tipoServicoEnum.FACBOOCK,
      idOrigem: objDados.idOrigem,
      idDestino: objConta.username,
      tpProcesso: 'P',
      hasCode: objDados.hasCode,
      idCategoria: objDados.idCategoria,
      idLoja: objDados.idLoja
    }

    const url = `${endPoint.urlServidorDatabase}/persistProcessado`
    await axios.post(url, objPost);
  return "OK"
}


function formatar(horarios: any) {
  var data = new Date(horarios)

  var day = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"][data.getDay()];
  var date = data.getDate();
  var month = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"][data.getMonth()];
  var year = data.getFullYear();
  var horario = `${data.getHours()}:${data.getMinutes()}`

  return `${day}, ${date} de ${month} de ${year} - ${horario}`;
}

