import axios from 'axios';
import { endPointDesEnum, endPointProdEnum } from '../enum/EndPointEnum';
import { isEmpty } from '../tools/Empty';

const endPoint = (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test' ? endPointProdEnum : endPointDesEnum)

export async function sincronizaLojaDefiniObjeto(listaLojas: any[], objConta: any){


    console.log(listaLojas)

    let lojasEnvio: any[] = [];
    for (var objL in listaLojas) {
        lojasEnvio.push(getObjetoLojaEnvio(listaLojas[objL], objConta))
    }

    //ENVIA PARA O SITE
    const urlEnv = `${endPoint.urlServidorWordPress}/loja`
    const lojasRetorno = await axios.post(urlEnv, lojasEnvio);

    //ATUALIZA NA BASE
    const url = `${endPoint.urlServidorDatabase}/persistProcessadoLista`
    await axios.post(url, setObjetoLojaEnvio(lojasRetorno.data , objConta));

    return "OK";
  
}

function getObjetoLojaEnvio(obj: any, objConta:any){
    console.log(obj);
    return {
        
        descricao: obj.descricao,
        thumbnail: obj.thumbnail,
        idLojaOrigem: obj.idLoja  ,
        idPlataformaContaProcessado: objConta.idPlataformaContaProcessado,
        situacao: obj.situacao,
        hascodeorigem: obj.hascodeorigem,  
    }
}

function setObjetoLojaEnvio(obj: any[], objConta: any){

    const objRetorno: any[] = [];
        for (const key in obj) {
            if(!isEmpty(obj[key].uidLoja)){
                objRetorno.push({
                    idPlataformaContaProcessado: objConta.idPlataformaContaProcessado,
                    idPlataforma : objConta.idPlataforma,
                    idPlataformaConta: objConta.idPlataformaConta,
                    idProcessamentoOrigem: objConta.idSincronizacao,
                    idSincronizacao: objConta.idSincronizacao,
                    tipoServico: objConta.tipoServico,
                    tipoInformacao: objConta.tipoInformacao,
                    idOrigem: obj[key].idLoja,
                    idDestino: obj[key].uidLoja,
                    urlDestino: obj[key].url,
                    tpProcesso: obj[key].situacao,
                    hasCode: obj[key].hascodeorigem,
                    thumbnailDestino: obj[key].thumbnailDestino
                })
            }
        }
    return objRetorno;
}
