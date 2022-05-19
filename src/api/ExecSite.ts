import axios from 'axios';
import { TipoInformacaoEnum } from '../enum/TipoInformacaoEnum';
import { tipoServicoEnum } from '../enum/TipoServicoEnum';
import { isEmpty } from '../tools/Empty';
import { finalizarProcessamento, startProcessamento } from '../tools/ProcessamentoAtualiza';
import { endPointDesEnum , endPointProdEnum} from '../enum/EndPointEnum';
import { sincronizaLojaDefiniObjeto } from './ExecSiteLoja';
import { sincronizaCategoriaDefiniObjeto } from './ExecSiteCategoria';
import { sincronizaOfertasDefiniObjeto } from './ExecSiteOferta';
const endPoint = (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test' ? endPointProdEnum : endPointDesEnum)

const site = (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test' ? 'https://ofertabest.com' : 'https://development.ofertabest.com')

export const ExecSite = async (objConta: any) => {
        await sincronizaLoja(getConta(TipoInformacaoEnum.LOJA)); 
        await sincronizarCategorias(getConta(TipoInformacaoEnum.CATEGORIA));
        await sincronizarCupons(getConta(TipoInformacaoEnum.CUPONS));
        await sincronizarOfertas(getConta(TipoInformacaoEnum.OFERTA));      
    return { status : 200};
}


async function sincronizaLoja(objConta: any){

    objConta = await iniciarProcesso(objConta)
    
    const urlDatabaseFindLojas = `${endPoint.urlServidorDatabase}/lojasPendSinc` 
    const listaLojas = await axios.post(urlDatabaseFindLojas, objConta);
    if(!isEmpty(listaLojas.data)){
        await sincronizaLojaDefiniObjeto(listaLojas.data, objConta)  
    }
    await finalizarProcesso(objConta)

    return "OK"
}

async function sincronizarCategorias(objConta: any){

    objConta = await iniciarProcesso(objConta)
    
    const urlDatabaseFindCategorias = `${endPoint.urlServidorDatabase}/categoriasPendSinc` 
    const listaCategorias = await axios.post(urlDatabaseFindCategorias, objConta);
    if(!isEmpty(listaCategorias.data)){
        await sincronizaCategoriaDefiniObjeto(listaCategorias.data, objConta)  
    }
    await finalizarProcesso(objConta)

    return "OK"
}


async function sincronizarCupons(objConta: any){

    objConta = await iniciarProcesso(objConta)
    
    const urlDatabaseFindCupons = `${endPoint.urlServidorDatabase}/cuponsPendSinc` 
    const listaCupons = await axios.post(urlDatabaseFindCupons, objConta);
    if(!isEmpty(listaCupons.data)){
        await sincronizaOfertasDefiniObjeto(TipoInformacaoEnum.CUPONS, listaCupons.data, objConta)  
    }
    await finalizarProcesso(objConta)

    return "OK"
}     


async function sincronizarOfertas(objConta: any){

    objConta = await iniciarProcesso(objConta)
    let processando = false;

    const qtLimit = 1000;
    let offset = 0;

    do{
        if(offset < (qtLimit * 1000)){

            console.log(`PROCESSANDO OFERTA ${offset}`)
            const urlDatabaseFindCupons = `${endPoint.urlServidorDatabase}/ofertasPendSinc?limit=${qtLimit}&offset=${offset}` 
            const listaCupons = await axios.post(urlDatabaseFindCupons, objConta);

            if(!isEmpty(listaCupons.data)){
                offset = offset + qtLimit
                processando = true;
                sincronizaOfertasDefiniObjeto(TipoInformacaoEnum.OFERTA, listaCupons.data, objConta)  
            }else{
                processando = false;
            }
        }else{
            processando = false;
        }

    }while(processando)
     
    await finalizarProcesso(objConta)

    return "OK"
}     

async function iniciarProcesso(objConta: any){

    console.log(`EXECUCAO ROTINA WORDPRESS ${Date()}`)
    const objProcessamento:any = await startProcessamento({ 
        idPlataforma: objConta.idPlataforma,                //OFERTBEST        
        idPlataformaConta: objConta.idPlataformaConta,      //CONTAUM  SITE EM WORDPRESS   
        tipoServico : objConta.tipoServico,          
        tipoInformacao : objConta.tipoInformacao,         
        dataProcessamentoInicio: Date(),
    })
    
    return objProcessamento;

}

async function finalizarProcesso(objConta: any){

    console.log(`FINALIZANDO ROTINA WORDPRESS ${Date()}`)
    await finalizarProcessamento({ 
        idPlataforma: objConta.idPlataforma,                
        idPlataformaConta: objConta.idPlataformaConta,      
        tipoServico : objConta.tipoServico,          
        tipoInformacao : objConta.tipoInformacao,         
        dataProcessamentoInicio: Date(),
    })

    return "OK"
    
}


function getConta(tipo: TipoInformacaoEnum): any {
    return {
        idPlataforma: 11,   //OFERTBEST        
        tipoServico : tipoServicoEnum.MOBILE,         
        tipoInformacao : tipo,         
        url: site,
        idPlataformaConta: 0,
    }
}
