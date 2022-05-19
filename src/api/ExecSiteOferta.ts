import axios from 'axios';
import { endPointDesEnum, endPointProdEnum } from '../enum/EndPointEnum';
import { TipoInformacaoEnum } from '../enum/TipoInformacaoEnum';
import { isEmpty } from '../tools/Empty';

const endPoint = (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test' ? endPointProdEnum : endPointDesEnum)

export async function sincronizaOfertasDefiniObjeto(tipo: TipoInformacaoEnum, listaObj: any[], objConta: any){

    let objsEnvio: any[] = [];
    for (var objL in listaObj) {
      
        objsEnvio.push(( tipo == TipoInformacaoEnum.OFERTA ? getObjetoOfertaEnvio(listaObj[objL]) : getObjetoCuponsEnvio(listaObj[objL]) ))
    }

    //ENVIA PARA O SITE
    const urlEnv = `${endPoint.urlServidorWordPress}/oferta`
    const objsRetorno = await axios.post(urlEnv, objsEnvio);

    //ATUALIZA NA BASE
    const url = `${endPoint.urlServidorDatabase}/persistProcessadoLista`
    axios.post(url,   setObjetoEnvio( objsRetorno.data, objConta));

    return { status : 200};
  
}

function getObjetoCuponsEnvio(obj: any){
    return {
            idLojaOrigem: obj.idcategorialoja,
            idCategoriaOrigem: obj.idcategoriacategoria,
            origem: TipoInformacaoEnum.CUPONS,
            idOrigem: obj.idCupon ,
            nome: obj.descricao,
            descricao: `Cupon disponibilizada pelo nosso parceiro ${obj.nomeLojaLomadee}.<br><br>Data da publicação ${formatar()} pela OfertaBest. <br><br>${obj.descricao}.`,
            link: obj.link,
            linkshort: obj.linkshort,
            thumbnail: obj.imagemcupon,
            preco: 0.00,
            precoForm: 0.00,
            expirado: false,
            dtInicio : null, 
            dtFim : obj.dataVigencia,
            dsCupon: obj.code,
            grauOferta: 0,
            hasCode: obj.hascodeorigem,
            situacao: obj.situacao,
            idcategoria: obj.idcategoria,
            idloja: obj.idloja
    }
}



function getObjetoOfertaEnvio(obj: any){
    return {
        idLojaOrigem: obj.idcategorialoja,
        idCategoriaOrigem: obj.idcategoriacategoria,
        origem: TipoInformacaoEnum.OFERTA,
        idOrigem: obj.idOferta,
        nome: obj.descricao,
        descricao: `Oferta disponibilizada pelo nosso parceiro ${obj.nomeLojaLomadee}.<br><br>Data da publicação ${formatar()} pela OfertaBest. <br><br>${obj.descricao}.`,
        link: obj.link,
        linkshort: obj.linkshort,
        thumbnail: obj.imagemoferta,
        preco: (isEmpty(obj.disconto) ?  (isEmpty(obj.precoForm) ? obj.preco : obj.precoForm) : (((isEmpty(obj.precoForm) ? obj.preco : obj.precoForm) *100) / (100 - obj.disconto) ) ),
        precoForm: (isEmpty(obj.precoForm) ? obj.preco : obj.precoForm),
        expirado: null,
        dtInicio : null, 
        dtFim : obj.dataVigencia,
        dsCupon: null,
        grauOferta: 0,
        idcategoria: obj.idcategoria,
        idloja: obj.idloja,
        situacao: obj.situacao,
        hasCode: obj.hascodeorigem,
    }
}

function setObjetoEnvio(obj: any, objConta: any){

    const objRetorno: any[] = [];
        for (const key in obj) {
            if(!isEmpty(obj[key].idDestino)){
                
                objRetorno.push({
                    idPlataformaContaProcessado: objConta.idPlataformaContaProcessado,
                    idPlataforma : objConta.idPlataforma,
                    idPlataformaConta: objConta.idPlataformaConta,
                    idProcessamentoOrigem: objConta.idSincronizacao,
                    idSincronizacao: objConta.idSincronizacao,
                    tipoServico: objConta.tipoServico,
                    tipoInformacao: objConta.tipoInformacao,
                    idOrigem: obj[key].idOrigem,
                    idDestino: obj[key].idDestino,
                    urlDestino: obj[key].url,
                    urlDestinoShort: obj[key].linkshort,
                    tpProcesso: obj[key].situacao,
                    hasCode: obj[key].hascodeorigem,
                    thumbnailDestino: obj[key].thumbnail,
                    idLoja: obj[key].idloja,
                    idCategoria: obj[key].idcategoria,
                })
            }
            
    }

    return objRetorno;
}

function formatar() {
    var data = new Date()
    return formatarString(data);
}

function formatarString(data: Date) {

    var day = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"][data.getDay()];
    var date = data.getDate();
    var month = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"][data.getMonth()];
    var year = data.getFullYear();
    var horario = `${(data.getHours() < 10 ? `0${data.getHours()}` : data.getHours()) }:${(data.getMinutes() < 10 ? `0${data.getMinutes()}` : data.getMinutes())}`
  
    return `${day}, ${date} de ${month} de ${year} - ${horario}`;
}