import axios from 'axios';
import { endPointDesEnum, endPointProdEnum } from '../enum/EndPointEnum';
import { isEmpty } from '../tools/Empty';

const endPoint = (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test' ? endPointProdEnum : endPointDesEnum)

export async function sincronizaCategoriaDefiniObjeto(listaCategorias: any[], objConta: any){

    let categoriasEnvio: any[] = [];
    for (var objL in listaCategorias) {
        categoriasEnvio.push(getObjetoCategoriaEnvio(listaCategorias[objL], objConta))
    }

    //ENVIA PARA O SITE
    const urlEnv = `${endPoint.urlServidorWordPress}/categoria`
    const categoriasRetorno = await axios.post(urlEnv, categoriasEnvio);

    //ATUALIZA NA BASE
    const url = `${endPoint.urlServidorDatabase}/persistProcessadoLista`
    await axios.post(url, setObjetoCategoriaEnvio(categoriasRetorno.data, objConta));

    return "OK";
  
}

function getObjetoCategoriaEnvio(obj: any, objConta: any){
    return {
        descricao: obj.descricao,
        idCategoriaOrigem: obj.idCategoria ,  
        idPlataformaContaProcessado: objConta.idPlataformaContaProcessado,
        situacao: obj.situacao,
        hascodeorigem: obj.hascodeorigem,
    }
}

function setObjetoCategoriaEnvio(obj: any, objConta: any){

    const objRetorno: any[] = [];

        for (const key in obj) {
            if(!isEmpty(obj[key].uidCategoria)){
                objRetorno.push({
                    idPlataformaContaProcessado: objConta.idPlataformaContaProcessado,
                    idPlataforma : objConta.idPlataforma,
                    idPlataformaConta: objConta.idPlataformaConta,
                    idProcessamentoOrigem: objConta.idSincronizacao,
                    idSincronizacao: objConta.idSincronizacao,
                    tipoServico: objConta.tipoServico,
                    tipoInformacao: objConta.tipoInformacao,
                    idOrigem: obj[key].idCategoria,
                    idDestino: obj[key].uidCategoria,
                    urlDestino: obj[key].url,
                    tpProcesso: obj[key].situacao,
                    hasCode: obj[key].hascodeorigem
                })
            }
        }

    return objRetorno;
}
