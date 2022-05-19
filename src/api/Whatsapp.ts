import axios from 'axios';
import { tipoServicoEnum } from '../enum/TipoServicoEnum';
import { endPointDesEnum , endPointProdEnum} from '../enum/EndPointEnum';
import { isEmpty } from '../tools/Empty';

const endPoint = (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test' ? endPointProdEnum : endPointDesEnum)

export const ExecWatsApp = async (objConta: any) => {

  try {
 
    console.log(`Executou rotina ${tipoServicoEnum.WHATSAPP.toString()}`)
    const listaOfertas: any[] = [];
    const listaObjecto: any[] = [];

    objConta.username = '-1001391470703554497764607-1610729478@g.us'
    objConta.tipoServiceDestino = tipoServicoEnum.WHATSAPP
    //const urlCategorias = `${endPoint.urlServidorDatabase}/categoriasAtivasPrincipal`
    //let objCategoriasPrincipal : any = await axios.get(urlCategorias)

    let objCategoriasPrincipal: any[] = [];
    objCategoriasPrincipal.push(50) // Moda Feminia
    objCategoriasPrincipal.push(45) // Eletrônicos
    objCategoriasPrincipal.push(53) // Beleza e Saúde
    objCategoriasPrincipal.push(65) // Animais
    objCategoriasPrincipal.push(51) // Moda Masculina
    objCategoriasPrincipal.push(54) // Infantil e Criança
    objCategoriasPrincipal.push(45) // Eletrônicos
    objCategoriasPrincipal.push(48) // Casa
    objCategoriasPrincipal.push(46) // Games e PC Gamer
    objCategoriasPrincipal.push(45) // Eletrônicos

    for (let index = 0; index < objCategoriasPrincipal.length; index++) {

      const element = objCategoriasPrincipal[index];
      
      const url = `${endPoint.urlServidorDatabase}/findPenpDivulgacao`
      //CONDICOES GERAL
      let objPostagem: any = await axios.post(url, objConta,{
        params: {
          limit: 10,
          offset: 0,
          fixado: true,
          listCatPai: `${element}`
        }
      })

      if(isEmpty(objPostagem.data)){
        objPostagem = await axios.post(url, objConta,{
          params: {
            limit: 10,
            offset: 0,
            destaque: true,
            listCatPai: `${element}`
          }
        })
      }

      if(isEmpty(objPostagem.data)){
        objPostagem = await axios.post(url, objConta,{
          params: {
            limit: 10,
            offset: 0,
            listCatPai: `${element}`
          }
        })
      }

      if(!isEmpty(objPostagem.data)){
        let obj = objPostagem.data[Math.floor(Math.random() * objPostagem.data.length)]
        
        listaObjecto.push(obj)
        listaOfertas.push({
          descricaoPost: `${obj.tipoorigem === 'C' ? 
                                `Cupon ${obj.descricao}\n\n`: 
                               `*${obj.descricao}*\n\n${(obj.precototal > obj.preco ? `💲 De: _~${obj.precototal}~_\n\n` : '')}💰 Por: *${obj.preco}*\n\n`}`,
          urlImageOrig: obj.thumbnail,
          link: obj.linkshort,
        })
        await efetivarProcessado(objConta, obj)
      }
    }

    if(isEmpty(listaOfertas)){
      return "Nenhuma oferta encontrada para divulgação";
    }

    await axios({
      method: 'post',
      url: `${endPoint.urlServidorWhatsApp}/postWats`,
      data: {
            site : `www.ofertabest.com`,
            listaOfertas: listaOfertas,
          }
    })

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
      tipoInformacao: tipoServicoEnum.WHATSAPP,
      idOrigem: objDados.idOrigem,
      idDestino: objConta.username,
      tpProcesso: 'F',
      hasCode: objDados.hasCode,
      idCategoria: objDados.idCategoria,
      idLoja: objDados.idLoja
    }

    const url = `${endPoint.urlServidorDatabase}/persistProcessado`
    axios.post(url, objPost);
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


function setList(obj: any){
}