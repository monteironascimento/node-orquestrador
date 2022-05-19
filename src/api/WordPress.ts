import axios from 'axios';
import { TipoInformacaoEnum } from '../enum/TipoInformacaoEnum';
import { tipoServicoEnum } from '../enum/TipoServicoEnum';
import { isEmpty } from '../tools/Empty';
import { finalizarProcessamento, startProcessamento } from '../tools/ProcessamentoAtualiza';
import { compararString, removeAcento } from '../tools/NormalizarString'


import { endPointDesEnum , endPointProdEnum} from '../enum/EndPointEnum';
const endPoint = (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test' ? endPointProdEnum : endPointDesEnum)

const site = (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test' ? 'https://ofertabest.com' : 'https://development.ofertabest.com')

const qtOfertas = 100;
const qtCategorias = 100;

export const ExecWordPress = async (objConta: any) => {

    try {  
        
        await sincronizaLoja({
            idPlataforma: 10,   //OFERTBEST        
            idPlataformaConta: 5,  //CONTAUM  SITE EM WORDPRESS   
            tipoServico : tipoServicoEnum.WORDPRESS,         
            tipoInformacao : TipoInformacaoEnum.LOJA,         
            dataProcessamentoInicio: Date(),
            url: site,
            consumerKey : 'ck_7a7ec430f64531a2eee616f01ae2c86d3df6c3f3',
            consumerSecret: 'cs_33f86464c511a1875325d4e91fefcc3cb29c3e20',
        });

        await sincronizarCategorias({
            idPlataforma: 10,   //OFERTBEST        
            idPlataformaConta: 6,  //CONTAUM  SITE EM WORDPRESS   
            tipoServico : tipoServicoEnum.WORDPRESS,         
            tipoInformacao : TipoInformacaoEnum.CATEGORIA,         
            dataProcessamentoInicio: Date(),
            url: site,
            consumerKey : 'ck_7a7ec430f64531a2eee616f01ae2c86d3df6c3f3',
            consumerSecret: 'cs_33f86464c511a1875325d4e91fefcc3cb29c3e20',
        });
    
        await sincronizaCupons({
            idPlataforma: 10,   //OFERTBEST        
            idPlataformaConta: 8,  //CONTAUM  SITE EM WORDPRESS   
            tipoServico : tipoServicoEnum.WORDPRESS,         
            tipoInformacao : TipoInformacaoEnum.CUPONS,         
            dataProcessamentoInicio: Date(),
            url: site,
            consumerKey : 'ck_7a7ec430f64531a2eee616f01ae2c86d3df6c3f3',
            consumerSecret: 'cs_33f86464c511a1875325d4e91fefcc3cb29c3e20',
        });

        await sincronizarOfertas({
            idPlataforma: 10,   //OFERTBEST        
            idPlataformaConta: 7,  //CONTAUM  SITE EM WORDPRESS   
            tipoServico : tipoServicoEnum.WORDPRESS,         
            tipoInformacao : TipoInformacaoEnum.OFERTA,         
            dataProcessamentoInicio: Date(),
            url: site,
            consumerKey : 'ck_7a7ec430f64531a2eee616f01ae2c86d3df6c3f3',
            consumerSecret: 'cs_33f86464c511a1875325d4e91fefcc3cb29c3e20',
        });
                        
    } catch (error) {
        console.log(error);       
    }

    return "OK";
}


async function sincronizaLoja(objConta: any){

    objConta = await iniciarProcesso(objConta)
    
    const urlDatabaseFindLojas = `${endPoint.urlServidorDatabase}/lojasPendSinc` 
    const listaLojas = await axios.post(urlDatabaseFindLojas, objConta);

    if(!isEmpty(listaLojas.data)){
        await sincronizaLojaDefiniObjeto(listaLojas.data, objConta)  
    }

    await ajustarLojas(objConta)

    objConta = await finalizarProcesso(objConta)

    return "OK"
}

async function ajustarLojas(objConta: any){

    console.log(`BUSCA LOJAS A CORRIGIR `)
    const urlDatabaseFindLojas = `${endPoint.urlServidorDatabase}/lojasNaoSincronizou` 
    let listaLojas = await axios.post(urlDatabaseFindLojas, objConta);
    listaLojas = listaLojas.data;


    console.log(listaLojas)

    if(!isEmpty(listaLojas)){

        for (const key in listaLojas) {
            const objCategoria = listaLojas[key];

            console.log(`LOJA ORIGEM - ${objCategoria.descricaocategoria}------------- `)


            const url = `${endPoint.urlServidorWordPress}/categoriaDescricao?&url=${objConta.url}&consumerKey=${objConta.consumerKey}&consumerSecret=${objConta.consumerSecret}&categoriaDescricao=${removeAcento(objCategoria.descricaocategoria)}`
            let objConsultaWordpress = await axios.get(url);
            
            for (const key in objConsultaWordpress.data) {
                const retornoWordPress = objConsultaWordpress.data[key];

                if(compararString(objCategoria.descricaocategoria, retornoWordPress.name)){

                    const objPost = {
                        idPlataformaContaProcessado: (isEmpty(objCategoria.idPlataformaContaProcessado)? null : objCategoria.idPlataformaContaProcessado),
                        idPlataforma : objConta.idPlataforma,
                        idPlataformaConta: objConta.idPlataformaConta,
                        idProcessamentoOrigem: objCategoria.idSincronizacao,
                        idSincronizacao: objConta.idSincronizacao,
                        tipoServico: objConta.tipoServico,
                        tipoInformacao: objConta.tipoInformacao,
                        idOrigem: objCategoria.idLoja,
                        idDestino: retornoWordPress.id,
                        urlDestino: `${objConta.url}/categoria/${retornoWordPress.slug}`,
                        tpProcesso: (isEmpty(objCategoria.idPlataformaContaProcessado) ? 'I' : 'A'),
                        hasCode: objCategoria.hascodeorigem
                    }

                    const urlDatabase = `${endPoint.urlServidorDatabase}/persistProcessado`
                    await axios.post(urlDatabase, objPost);
                    break;
                } 

            }

        }

    }

    return "OK"
}


async function sincronizaLojaDefiniObjeto(listaLojas: any[], objConta: any){

    for (var objL in listaLojas) {
        try {
            
            const objLoja = listaLojas[objL];

            console.log(`LOJA SINCRONIZA ${objLoja.idLoja}`)

            let retornoWordPress: any = {};
       
            if(objLoja.situacao === "I"){ //INSERT

                let data;
                if(!isEmpty(objLoja.thumbnail)){
                    data = {
                        name: objLoja.descricao,
                        image: {
                        src: objLoja.thumbnail
                        }
                    };
                }else{
                    data = {
                        name: objLoja.descricao,
                    };
                }

                const url = `${endPoint.urlServidorWordPress}/categoriaInsert?url=${objConta.url}&consumerKey=${objConta.consumerKey}&consumerSecret=${objConta.consumerSecret}`
                retornoWordPress = await axios.post(url, data);
                retornoWordPress = retornoWordPress.data;

            }else if(objLoja.situacao === 'A'){ //UPDATE
                const data = {
                    description: objLoja.descricao
                };

                const url = `${endPoint.urlServidorWordPress}/categoriaUpdate?id=${objLoja.idDestino}&url=${objConta.url}&consumerKey=${objConta.consumerKey}&consumerSecret=${objConta.consumerSecret}`
                retornoWordPress = await axios.post(url, data);
                retornoWordPress = retornoWordPress.data;

            }else if(objLoja.situacao === 'D'){ //DELETE
                const url = `${endPoint.urlServidorWordPress}/categoriaDelete?id=${objLoja.idDestino}&url=${objConta.url}&consumerKey=${objConta.consumerKey}&consumerSecret=${objConta.consumerSecret}`
                retornoWordPress = await axios.post(url, "");
                retornoWordPress = retornoWordPress.data;
            }

            if(retornoWordPress.id > 0){
                
                const objPost = {
                    idPlataformaContaProcessado: objLoja.idPlataformaContaProcessado,
                    idPlataforma : objConta.idPlataforma,
                    idPlataformaConta: objConta.idPlataformaConta,
                    idProcessamentoOrigem: objLoja.idSincronizacao,
                    idSincronizacao: objConta.idSincronizacao,
                    tipoServico: objConta.tipoServico,
                    tipoInformacao: objConta.tipoInformacao,
                    idOrigem: objLoja.idLoja,
                    idDestino: retornoWordPress.id,
                    urlDestino: `${objConta.url}/categoria/${retornoWordPress.slug}`,
                    tpProcesso: objLoja.situacao,
                    hasCode: objLoja.hascodeorigem
                }

                const url = `${endPoint.urlServidorDatabase}/persistProcessado`
                const ret = await axios.post(url, objPost);

            }

        } catch (error) {
            console.log(error)
        }

    }

    return "OK";
    
}


async function sincronizarCategorias(objConta: any){

    objConta = await iniciarProcesso(objConta)

    let limite = 10000;
    let offset = 0;
    let qtProdutoBatch = qtCategorias

    let urlDatabaseFindCategorias = `${endPoint.urlServidorDatabase}/categoriasPendSinc?limit=${limite}&offset=${offset}` 
    let listaCategorias: any = await axios.post(urlDatabaseFindCategorias, objConta);
    listaCategorias = listaCategorias.data

    console.log(`INICIOU O PROCESSO DE SINCRONIZACAO CATEGORIA  ----- ${objConta.idSincronizacao} -- QUANTIDADE ${listaCategorias.length}`)

    if(listaCategorias.length < qtProdutoBatch){
        qtProdutoBatch = listaCategorias.length
    }

    let cont = 0;
    let contTot = 0;
    let lista: any[] = []
    for (const key in listaCategorias) {

        cont ++;
        contTot ++;
        lista.push(listaCategorias[key])

        if(qtProdutoBatch === contTot || qtProdutoBatch === cont){
            cont = 0;
            console.log(`INICIOU O PROCESSO DE SINCRONIZACAO CATEGORIA  ----- ${objConta.idSincronizacao}  QTD: ${lista.length}`)
            await sincronizaCategoriaDefiniObjeto(lista, objConta)  
            lista = [];
        }
    }

    //BUSCA CATEGORIAS QUE NAO TEM ID DE DESTINO E BUSCA NO ENDPOITN DO WORDPRES VERIFICA SE EXISTE AJUSTA BASE
    console.log(`INICIOU O AJUSTE DE CATEGORIA  ----- ${objConta.idSincronizacao}`)
    await ajustarCategorias(objConta)

    objConta = await finalizarProcesso(objConta)
    console.log(`FINALIZOU O AJUSTE DE CATEGORIA  ----- ${objConta.idSincronizacao}`)

    return "OK"
}


async function ajustarCategorias(objConta: any){

    const urlDatabaseFindCategorias = `${endPoint.urlServidorDatabase}/categoriasNaoSincronizou` 
    let listaCategorias = await axios.post(urlDatabaseFindCategorias, objConta);
    listaCategorias = listaCategorias.data;

    console.log(listaCategorias)

    if(!isEmpty(listaCategorias)){

        for (const key in listaCategorias) {
            const objCategoria = listaCategorias[key];

            console.log(`CATEGORIA EM CORRECAO:  ${objCategoria.idCategoria} ${objCategoria.descricaocategoria}`)

            const url = `${endPoint.urlServidorWordPress}/categoriaDescricao?&url=${objConta.url}&consumerKey=${objConta.consumerKey}&consumerSecret=${objConta.consumerSecret}&categoriaDescricao=${removeAcento(objCategoria.descricaocategoria)}`
            let objConsultaWordpress = await axios.get(url);
                
            for (const key in objConsultaWordpress.data) {
                    const retornoWordPress = objConsultaWordpress.data[key];

                if(compararString(objCategoria.descricaocategoria, retornoWordPress.name)){    

                    const objPost = {
                            idPlataformaContaProcessado: (isEmpty(objCategoria.idPlataformaContaProcessado) ?  null : objCategoria.idPlataformaContaProcessado),
                            idPlataforma : objConta.idPlataforma,
                            idPlataformaConta: objConta.idPlataformaConta,
                            idProcessamentoOrigem: objCategoria.idProcessamentoOrigem,
                            idSincronizacao: objConta.idSincronizacao,
                            tipoServico: objConta.tipoServico,
                            tipoInformacao: objConta.tipoInformacao,
                            idOrigem: objCategoria.idCategoria,
                            idDestino: retornoWordPress.id,
                            urlDestino: `${objConta.url}/categoria/${retornoWordPress.slug}`,
                            tpProcesso: (isEmpty(objCategoria.idPlataformaContaProcessado) ?  'I' : 'A'),
                            hasCode: objCategoria.hascodeorigem
                    }
                    const urlDatabase = `${endPoint.urlServidorDatabase}/persistProcessado`
                    await axios.post(urlDatabase, objPost);
                    break;
                }
            }
               

        }

    }

    return "OK"
}


async function sincronizaCategoriaDefiniObjeto(listaCategorias: any[], objConta: any){

    let insert: any[] = [];
    let update: any[] = [];
    let remove: any[] = [];

    for (var objL in listaCategorias) {
        try {
            
            const objCategoria = listaCategorias[objL];

            if(objCategoria.situacao === "I"){

                console.log(`CATEGORIA SINCRONIZA ${objCategoria.idCategoria} -- ${objCategoria.descricao}  ${objCategoria.situacao}`)

                let retornoWordPress: any = {};

                if(objCategoria.situacao === "I"){ //INSERT
                    const data = {
                        name: objCategoria.descricao,
                    };

                    insert.push(data);

                }else if(objCategoria.situacao === 'A'){ //UPDATE
                    const data = {
                        id: objCategoria.idDestino,
                        description: objCategoria.descricao
                    };
                    update.push(data)

                }else if(objCategoria.situacao === 'D'){ //DELETE
                    remove.push(objCategoria.idDestino)
                }

                if(retornoWordPress.code === 'term_exists'){
                    retornoWordPress = retornoWordPress.data;
                }

            }
        } catch (error) {
            
        }

    }

    const data = {
        create: insert,
        update: update,
        delete: remove
    }

    const urlWordPress = `${endPoint.urlServidorWordPress}/categoriaBatch?url=${objConta.url}&consumerKey=${objConta.consumerKey}&consumerSecret=${objConta.consumerSecret}`
    let retornoWordPress: any = await axios.post(urlWordPress, data);
    retornoWordPress = retornoWordPress.data
    
    let objListaPersistencia: any[] = [];

    for (const key in retornoWordPress.create) {

        const objInsertWordPress = retornoWordPress.create[key];

        if(objInsertWordPress.id > 0 && isEmpty(objInsertWordPress.error) ){

            let objCategoria:any = listaCategorias.filter(obj => obj.descricaocategoria === objInsertWordPress.name);
            objCategoria = objCategoria[0]  

            if(!isEmpty(objCategoria)){

                const objPost = {
                    idPlataforma : objConta.idPlataforma,
                    idPlataformaConta: objConta.idPlataformaConta,
                    idSincronizacao: objConta.idSincronizacao,
                    tipoServico: objConta.tipoServico,
                    tipoInformacao: objConta.tipoInformacao,
                    idOrigem: objCategoria.idCategoria,
                    idDestino: objInsertWordPress.id,
                    urlDestino: `${objConta.url}/categoria/${objInsertWordPress.slug}`,
                    tpProcesso: objCategoria.situacao,
                    hasCode: objCategoria.hascodeorigem
                }
                objListaPersistencia.push(objPost)
            }
           
        }
    }

    for (const key in retornoWordPress.update) {

        const objUpdateWordPress = retornoWordPress.update[key];

        if(objUpdateWordPress.id > 0 && isEmpty(objUpdateWordPress.error)){

            let objCategoria:any = listaCategorias.filter(obj => obj.descricaocategoria === objUpdateWordPress.name);

            objCategoria = objCategoria[0]       

            const objPost = {
                    idPlataformaContaProcessado: objCategoria.idPlataformaContaProcessado,
                    idPlataforma : objConta.idPlataforma,
                    idPlataformaConta: objConta.idPlataformaConta,
                    idProcessamentoOrigem: objCategoria.idSincronizacao,
                    idSincronizacao: objConta.idSincronizacao,
                    tipoServico: objConta.tipoServico,
                    tipoInformacao: objConta.tipoInformacao,
                    idOrigem: objCategoria.idCategoria,
                    idDestino: objUpdateWordPress.id,
                    urlDestino: `${objConta.url}/categoria/${objUpdateWordPress.slug}`,
                    tpProcesso: objCategoria.situacao,
                    hasCode: objCategoria.hascodeorigem
            }
            objListaPersistencia.push(objPost)
        }
    }

    if(!isEmpty(objListaPersistencia)){
        const url = `${endPoint.urlServidorDatabase}/persistProcessadoLista`
        await axios.post(url, objListaPersistencia);
    }

    return "OK";
    
}

async function sincronizaCupons(objConta: any){

    objConta = await iniciarProcesso(objConta)
    
    const urlDatabaseFindCupons = `${endPoint.urlServidorDatabase}/cuponsPendSinc` 
    const listaCupons = await axios.post(urlDatabaseFindCupons, objConta);
    if(!isEmpty(listaCupons.data)){
        await sincronizCuponsDefiniObjeto(listaCupons.data, objConta)  
    }    

    ajustarCupons(objConta)

    objConta = await finalizarProcesso(objConta)

    return "OK"
}


async function ajustarCupons(objConta: any){

    const urlDatabaseFindLojas = `${endPoint.urlServidorDatabase}/cuponsNaoSincronizou` 
    let listaCupons = await axios.post(urlDatabaseFindLojas, objConta);
    listaCupons = listaCupons.data;

    if(!isEmpty(listaCupons)){

        for (const key in listaCupons) {
            const objCupon = listaCupons[key];

            const objSku:string = `CUPON${objCupon.idCupon}CUPON`
            console.log(objSku)

            const url = `${endPoint.urlServidorWordPress}/produtosku?&url=${objConta.url}&consumerKey=${objConta.consumerKey}&consumerSecret=${objConta.consumerSecret}&sku=${objSku}`
            let objConsultaWordpress = await axios.get(url);
            objConsultaWordpress = objConsultaWordpress.data;
            const retornoWordPress = objConsultaWordpress[0];

            console.log(retornoWordPress)

            if(!isEmpty(retornoWordPress)){
           

                const objPost = {
                    idPlataformaContaProcessado: (isEmpty(objCupon.idPlataformaContaProcessado) ? null : objCupon.idPlataformaContaProcessado),
                    idPlataforma : objConta.idPlataforma,
                    idPlataformaConta: objConta.idPlataformaConta,
                    idProcessamentoOrigem: objConta.idSincronizacao,
                    idSincronizacao: objConta.idSincronizacao,
                    tipoServico: objConta.tipoServico,
                    tipoInformacao: objConta.tipoInformacao,
                    idOrigem: objCupon.idCupon,
                    urlDestino: retornoWordPress.permalink,
                    priceHtml: retornoWordPress.price_html,
                    idDestino: retornoWordPress.id,
                    tpProcesso: (isEmpty(objCupon.idPlataformaContaProcessado) ? 'I' : 'A'),
                    hasCode: objCupon.hascodeorigem,
                    thumbnailDestino: (isEmpty(retornoWordPress.images) ? '' : retornoWordPress.images[0].src),
                }

                const urlDatabase = `${endPoint.urlServidorDatabase}/persistProcessado`
                const ret = await axios.post(urlDatabase, objPost);

            }

        }

    }

    return "OK"
}


async function sincronizCuponsDefiniObjeto(listaCupons: any[], objConta: any){

    for (var objL in listaCupons) {
        try {
            
            const objCupon = listaCupons[objL];
            console.log(`CUPON SELECIONADO PARA SINCRONIZACAO ${objCupon.idCupon}`)

            const listCategoria: any[] = []; 

            if(objCupon.idcategorialoja > 0){
                listCategoria.push({ id: objCupon.idcategorialoja});
            }
            if(objCupon.idcategoriacategoria > 0){
                listCategoria.push({ id: objCupon.idcategoriacategoria});
            }
            if(objCupon.idcategoriaoferta > 0){
                listCategoria.push({ id: objCupon.idcategoriaoferta});
            }

            const listaTags: any[] = []; 
            if(!isEmpty(objCupon.tagcategorialoja)){
                listaTags.push(objCupon.tagcategorialoja);
            }

            if(!isEmpty(objCupon.tagcategoriacategoria)){
                listaTags.push(objCupon.tagcategoriacategoria);
            }

            if(!isEmpty(objCupon.tagcategoriaoferta)){
                listaTags.push(objCupon.tagcategoriaoferta);
            }

            let valCupon = '';
            if(!isEmpty(objCupon.idcategoriaoferta) && !isEmpty(objCupon.dataVigencia)){
                valCupon = `Atenção a validade do Cupon é de ${formatarString(new Date(objCupon.dataVigencia))}`
            }

            //const resImagem = await axios.get(objCupon.imagemcupon);
            //if(resImagem.status == 200){

                let retornoWordPress: any = {};
                if(objCupon.situacao === "I"){ //INSERT

                    const data = {
                        name: `${(isEmpty(objCupon.descricaoloja) ? '' : `(${objCupon.descricaoloja})  `)  }${objCupon.descricaocupon}  -- ${objCupon.idCupon}`,
                        type: "external",
                        status: "publish",
                        sku: `CUPON${objCupon.idCupon}CUPON`,
                        price: 0,
                        external_url: objCupon.linkcupon,
                        button_text: "Resgatar Cupon",
                        reviews_allowed: false,
                        average_rating: "0.00",
                        rating_count: 1,
                        description: `Cupon disponibilizado pelo nosso parceiro ${objCupon.nomeLojaLomadee}.<br><br>Data da publicação ${formatar()} pela OfertaBest<br><br>${objCupon.descricaocupon}. ${valCupon}`,
                        short_description: `CUPON: ${objCupon.code}. ${valCupon} <br>Atenção, os Cupons são por tempo limitado, podendo variar de acordo com as políticas da loja e regras da promoção. - Corra e garanta o seu!`,
                        categories: listCategoria,
                        stock_status: "instock",
                        meta_data:[
                            {
                                key: "_external_target_blank",
                                value: "yes"
                            },
                            {
                            key: "_knawatfibu_url",
                                value: {
                                    img_url: objCupon.imagemcupon,
                                    width: "",
                                    height: ""
                                    }
                            }
                        ]
                        //tags: listaTags,
                    // images: [
                    // {
                        //    src: objCupon.imagemcupon
                        //},
                        //],
                    };

                    const url = `${endPoint.urlServidorWordPress}/produtoInsert?url=${objConta.url}&consumerKey=${objConta.consumerKey}&consumerSecret=${objConta.consumerSecret}`
                    retornoWordPress = await axios.post(url, data);
                    retornoWordPress = retornoWordPress.data;

                }else if(objCupon.situacao === 'A'){ //UPDATE

                    const data = {
                        name: `${(isEmpty(objCupon.descricaoloja) ? '' : `(${objCupon.descricaoloja})  `)}${objCupon.descricaocupon} -- ${objCupon.idCupon}`,
                        type: "external",
                        status: "publish",
                        sku: `CUPON${objCupon.idCupon}CUPON`,
                        price: 0,
                        external_url: objCupon.linkcupon,
                        button_text: "Resgatar Cupon",
                        reviews_allowed: false,
                        average_rating: "0.00",
                        rating_count: 1,
                        description: `Cupon disponibilizado pelo nosso parceiro ${objCupon.nomeLojaLomadee}.<br><br>Data da publicação ${formatar()} pela OfertaBest<br><br>${objCupon.descricaocupon}. ${valCupon}`,
                        short_description: `CUPON: ${objCupon.code}. ${valCupon} <br>Atenção, os Cupons são por tempo limitado, podendo variar de acordo com as políticas da loja e regras da promoção. - Corra e garanta o seu!`,
                        categories: listCategoria,
                        stock_status: "instock",
                        meta_data:[
                                {
                                    key: "_external_target_blank",
                                    value: "yes"
                                },
                                {
                                key: "_knawatfibu_url",
                                    value: {
                                        img_url: objCupon.imagemcupon,
                                        width: "",
                                        height: ""
                                        }
                                }
                        ]
                                                //tags: listaTags,
                        //images: [
                        //    {
                        //        src: objCupon.imagemcupon
                        //    },
                        //    ],
                    };
                    const url = `${endPoint.urlServidorWordPress}/produtoUpdate?id=${objCupon.idDestino}&url=${objConta.url}&consumerKey=${objConta.consumerKey}&consumerSecret=${objConta.consumerSecret}`
                    retornoWordPress = await axios.post(url, data);
                    retornoWordPress = retornoWordPress.data;

                }else if(objCupon.situacao === 'D'){ //DELETE

                    const data = {
                        stock_status: "instock",
                    };
                    const url = `${endPoint.urlServidorWordPress}/produtoUpdate?id=${objCupon.idDestino}&url=${objConta.url}&consumerKey=${objConta.consumerKey}&consumerSecret=${objConta.consumerSecret}`
                    retornoWordPress = await axios.post(url, data);
                    retornoWordPress = retornoWordPress.data;

                    /*
                    const url = `${endPoint.urlServidorWordPress}/produtoDelete?id=${objCupon.idDestino}&url=${objConta.url}&consumerKey=${objConta.consumerKey}&consumerSecret=${objConta.consumerSecret}`
                    retornoWordPress = await axios.post(url, "");
                    retornoWordPress = retornoWordPress.data;*/
                }
        

                if(retornoWordPress.id > 0){
                    const objPost = {
                        idPlataformaContaProcessado: objCupon.idPlataformaContaProcessado,
                        idPlataforma : objConta.idPlataforma,
                        idPlataformaConta: objConta.idPlataformaConta,
                        idProcessamentoOrigem: objCupon.idSincronizacao,
                        idSincronizacao: objConta.idSincronizacao,
                        tipoServico: objConta.tipoServico,
                        tipoInformacao: objConta.tipoInformacao,
                        idOrigem: objCupon.idCupon,
                        urlDestino: retornoWordPress.permalink,
                        priceHtml: retornoWordPress.price_html,
                        idDestino: retornoWordPress.id,
                        tpProcesso: objCupon.situacao,
                        hasCode: objCupon.hascodeorigem,
                        thumbnailDestino: (isEmpty(retornoWordPress.images[0].src) ? '' :retornoWordPress.images[0].src),
                    }

                    const url = `${endPoint.urlServidorDatabase}/persistProcessado`
                    await axios.post(url, objPost);
                }

            /*}else{
               
                const objPost = {
                        idPlataformaContaProcessado: objCupon.idPlataformaContaProcessado,
                        idPlataforma : objConta.idPlataforma,
                        idPlataformaConta: objConta.idPlataformaConta,
                        idProcessamentoOrigem: objCupon.idSincronizacao,
                        idSincronizacao: objConta.idSincronizacao,
                        tipoServico: objConta.tipoServico,
                        tipoInformacao: objConta.tipoInformacao,
                        idOrigem: objCupon.idCupon,
                        tpProcesso: 'E',
                        hasCode: objCupon.hascodeorigem,
                        dsErro: "Imagem nao encontrada"
                }

                const url = `${endPoint.urlServidorDatabase}/persistProcessado`
                await axios.post(url, objPost);
            }*/
        } catch (error) {
                
        }
    
    }

    return "OK";
    
}

async function sincronizarOfertas(objConta: any){

    objConta = await iniciarProcesso(objConta)

    const urlBuscasLojas = `${endPoint.urlServidorDatabase}/lojas`
    let objLojas: any = await axios.get(urlBuscasLojas)
    objLojas = objLojas.data;

    for (const key in objLojas) {
        try {
            console.log(` LOJA A SINCRONIZAR OFERTAS ${objLojas[key].idLoja}  ---- ${objLojas[key].descricao}`)
            await sincronizOfertasPorLoja(objLojas[key], objConta)
        } catch (error) {
                
        }
    }

    objConta = await finalizarProcesso(objConta)

    return "OK"
}


async function sincronizOfertasPorLoja(loja: any, objConta: any){

    let listaOfertas: any;
    
    let limite = 99
    let offset = 0;
    let qtProdutoBatch = qtOfertas;

    let urlDatabaseFindCupons = `${endPoint.urlServidorDatabase}/ofertasPendSinc?limit=${limite}&offset=${offset}&idLoja=${loja.idLoja}` 
    listaOfertas = await axios.post(urlDatabaseFindCupons, objConta);
    listaOfertas = listaOfertas.data

    console.log

    if(listaOfertas.length < qtProdutoBatch){
        qtProdutoBatch = listaOfertas.length
    }

    console.log(`INICIOU O PROCESSO DE SINCRONIZACAO OFERTAS LOJA ${loja.idLoja} - ${loja.descricao}  ----    QT ${listaOfertas.length} --- QTBATCH ${qtProdutoBatch}`)

    let cont = 0;
    let contTot = 0;
    let lista: any[] = []
    for (const key in listaOfertas) {
       
        cont ++;
        contTot ++;
        lista.push(listaOfertas[key])

        if(qtProdutoBatch === contTot || qtProdutoBatch === cont){
            cont = 0;
            console.log(`INICIOU O PROCESSO DE SINCRONIZACAO OFERTA POR LOJA  ----- ${objConta.idSincronizacao} LOJA ${loja.idLoja} - ${loja.descricao}  ----    QTD: ${contTot} -- ${listaOfertas.length}`)
            try {
                
                await sincronizOfertasDefiniObjetoBatch(lista, objConta) 
                

            } catch (error) {
                console.log(error)       
            }
            lista = [];
        }

    }

    ajustarOfertasLoja(loja, objConta) 

    return "OK"
}

async function ajustarOfertasLoja(loja: any, objConta: any){

    const urlDatabaseFindOfertas = `${endPoint.urlServidorDatabase}/ofertasNaoSincronizou?idLoja=${loja.idLoja}` 
    let listaOfertas: any = await axios.post(urlDatabaseFindOfertas, objConta);
    listaOfertas = listaOfertas.data;

    console.log(`OFERTAS QUE NECESSITAM DE AJUSTE NA BASE ${listaOfertas.length}`)

    if(!isEmpty(listaOfertas)){

        for (const key in listaOfertas) {
            const objOferta = listaOfertas[key];

            const objSku:string = `OFERTA${objOferta.idOferta}OFERTA`
            console.log(`OFERTA EM CORRECAO:  ${objSku} - ${objOferta.nomeLojaLomadee}`)
            

            const url = `${endPoint.urlServidorWordPress}/produtosku?&url=${objConta.url}&consumerKey=${objConta.consumerKey}&consumerSecret=${objConta.consumerSecret}&sku=${objSku}`
            let objConsultaWordpress = await axios.get(url);
            objConsultaWordpress = objConsultaWordpress.data;
            const retornoWordPress = objConsultaWordpress[0];

            if(!isEmpty(retornoWordPress)){

                const objPost = {
                    idPlataformaContaProcessado: objOferta.idPlataformaContaProcessado,
                    idPlataforma : objConta.idPlataforma,
                    idPlataformaConta: objConta.idPlataformaConta,
                    idProcessamentoOrigem: objConta.idSincronizacao,
                    idSincronizacao: objConta.idSincronizacao,
                    tipoServico: objConta.tipoServico,
                    tipoInformacao: objConta.tipoInformacao,
                    idOrigem: objOferta.idOferta,
                    urlDestino: retornoWordPress.permalink,
                    priceHtml: retornoWordPress.price_html,
                    idDestino: retornoWordPress.id,
                    tpProcesso: (isEmpty(objOferta.idPlataformaContaProcessado)? 'I' : 'A'),
                    hasCode: objOferta.hascodeorigem,
                    thumbnailDestino: (isEmpty(retornoWordPress.images) ? '' :retornoWordPress.images[0].src),
                }

                const urlDatabase = `${endPoint.urlServidorDatabase}/persistProcessado`
                await axios.post(urlDatabase, objPost);

            }

        }

    }

    return "OK"
}

async function sincronizOfertasDefiniObjetoBatch(listaCupons: any[], objConta: any){

    let insert: any[] = [];
    let update: any[] = [];
    let remove: any[] = [];
    let objListaPersistencia: any[] = [];

    for (var objL in listaCupons) {
        try {

            const objOferta = listaCupons[objL];  
            console.log(`OFERTA SINCRONIZA ${objOferta.idOferta} - ${objOferta.nomeLojaLomadee}`)

                const listCategoria: any[] = []; 

                if(objOferta.idcategorialoja > 0){
                    listCategoria.push({ id: objOferta.idcategorialoja});
                }

                if(objOferta.idcategoriacategoria > 0){
                    listCategoria.push({ id: objOferta.idcategoriacategoria});
                }
                if(objOferta.idcategoriaoferta > 0){
                    listCategoria.push({ id: objOferta.idcategoriaoferta});
                }

                const listaTags: any[] = []; 

                if(!isEmpty(objOferta.tagCategoriaLoja)){
                    listaTags.push(objOferta.tagCategoriaLoja);
                }

                if(!isEmpty(objOferta.tagCategoriaCategoria)){
                    listaTags.push(objOferta.tagCategoriaCategoria);
                }

                if(!isEmpty(objOferta.tagCategoriaOferta)){
                    listaTags.push(objOferta.tagCategoriaOferta);
                }

                if(isEmpty(objOferta.imagemoferta)){
                    objOferta.imagemoferta = objOferta.thumbnailLojaLomadee
                }

                if(isEmpty(objOferta.link)){
                    objOferta.link = objOferta.linkLojaLomadee
                }
                
                if(objOferta.imagemoferta.includes(`.png\\`)){
                    objOferta.imagemoferta = objOferta.imagemoferta.replace(`.png\\`, '.png');
                }    

                if(!objOferta.imagemoferta.includes('.jpeg') && !objOferta.imagemoferta.includes('.png') && !objOferta.imagemoferta.includes('.jpg')){
                    objOferta.imagemoferta = `${objOferta.imagemoferta}.jpeg`
                }  

                //const resImagem = await axios.get(objOferta.imagemoferta);
                //if(resImagem.status == 200){

                    if(objOferta.situacao === "I"){ //INSERT

                        const data = {
                            name: `${objOferta.descricao} -- ${objOferta.idOferta}`,
                            type: "external",
                            status: "publish",
                            sku: `OFERTA${objOferta.idOferta}OFERTA`,
                            //price: (isEmpty(objOferta.disconto) ?  objOferta.preco : (objOferta.preco - objOferta.disconto) ),
                            sale_price: (isEmpty(objOferta.precoForm) ? objOferta.preco : objOferta.precoForm), 
                            regular_price: (isEmpty(objOferta.disconto) ?  (isEmpty(objOferta.precoForm) ? objOferta.preco : objOferta.precoForm) : (((isEmpty(objOferta.precoForm) ? objOferta.preco : objOferta.precoForm) *100) / (100 - objOferta.disconto) ) ),
                            //regular_price: 0,
                            //sale_price: 0,
                            external_url: objOferta.link,
                            button_text: "Resgatar Oferta",
                            reviews_allowed: false,
                            average_rating: (isEmpty(objOferta.disconto) ? "0.00" : objOferta.disconto),
                            rating_count: 1,
                            description: `Oferta disponibilizada pelo nosso parceiro ${objOferta.nomeLojaLomadee}.<br><br>Data da publicação ${formatar()} pela OfertaBest.<br><br>${objOferta.descricao}.`,
                            short_description: `Atenção as ofertas são por tempo limitado e disponiblidade de estoque, podendo variar de acordo com as políticas da loja e regras da promoção. - Corra e garanta o seu!`,
                            categories: listCategoria,
                            stock_status: "instock",
                            meta_data:[
                                    {
                                        key: "pro_price_extra_info_position",
                                        value: "yes"
                                    },
                                    {
                                        key: "pro_price_extra_info",
                                        value: `<img src=\"${objOferta.thumbnailLojaLomadee}\" alt=“${objOferta.nomeLojaLomadee.replaceAll('\"', '')}” class=\"logolojas\"><br>`
                                    },
                                    {
                                        key: "_external_target_blank",
                                        value: "yes"
                                    },
                                    {
                                    key: "_knawatfibu_url",
                                        value: {
                                            img_url: objOferta.imagemoferta,
                                            width: "",
                                            height: ""
                                            }
                                    }
                            ]
                            
                            // images: [
                            // {
                            //     src: objOferta.imagemoferta,
                            // }],
                            // price_html: `<img src="${objOferta.thumbnailLojaLomadee}" alt=“${objOferta.nomeLojaLomadee}” class="logolojas">`,

                        };
                        insert.push(data);
                    
                    }else if(objOferta.situacao === 'A'){ //UPDATE

                        const data = {
                            id: objOferta.idDestino,
                            name: `${objOferta.descricao} -- ${objOferta.idOferta}`,
                            type: "external",
                            status: "publish",
                            sku: `OFERTA${objOferta.idOferta}OFERTA`,
                            //price: (isEmpty(objOferta.disconto) ?  objOferta.preco : (objOferta.preco - objOferta.disconto) ),
                            sale_price: (isEmpty(objOferta.precoForm) ? objOferta.preco : objOferta.precoForm), 
                            regular_price: (isEmpty(objOferta.disconto) ?  (isEmpty(objOferta.precoForm) ? objOferta.preco : objOferta.precoForm) : (((isEmpty(objOferta.precoForm) ? objOferta.preco : objOferta.precoForm) *100) / (100 - objOferta.disconto) ) ),
                            external_url: objOferta.link,
                            button_text: "Resgatar Oferta",
                            reviews_allowed: false,
                            average_rating: (isEmpty(objOferta.disconto) ? "0.00" : objOferta.disconto),
                            rating_count: 1,
                            description: `Oferta disponibilizada pelo nosso parceiro ${objOferta.nomeLojaLomadee}.<br><br>Data da publicação ${formatar()} pela OfertaBest.<br><br>${objOferta.descricao}.`,
                            short_description: `Atenção as ofertas são por tempo limitado e disponiblidade de estoque, podendo variar de acordo com as políticas da loja e regras da promoção. - Corra e garanta o seu!`,                       
                            categories: listCategoria,
                            stock_status: "instock",
                            //tags: listaTags,
                            //images: [
                            //{
                            //    src: objOferta.imagemoferta
                            //}],
                            //price_html: `<img src="${objOferta.thumbnailLojaLomadee}" alt=“${objOferta.nomeLojaLomadee}” class="logolojas">`,
                            meta_data:[
                                {
                                    key: "pro_price_extra_info_position",
                                    value: "yes"
                                },
                                {
                                    key: "pro_price_extra_info",
                                    value: `<img src=\"${objOferta.thumbnailLojaLomadee}\" alt=“${objOferta.nomeLojaLomadee.replaceAll('\"', '')}” class=\"logolojas\"><br>`
                                },
                                {
                                    key: "_external_target_blank",
                                    value: "yes"
                                },
                                {
                                key: "_knawatfibu_url",
                                    value: {
                                        img_url: objOferta.imagemoferta,
                                        width: "",
                                        height: ""
                                        }
                                }
                            ]
    
                        };
                        
                        update.push(data);

                    }else if(objOferta.situacao === 'D'){ //DELETE

                        const data = {
                            stock_status: "instock",
                        };
                        
                        update.push(data);
                        //remove.push(objOferta.idDestino);//
                    }

                /*}else{

                    const objPost = {
                        idPlataformaContaProcessado: objOferta.idPlataformaContaProcessado,
                        idPlataforma : objConta.idPlataforma,
                        idPlataformaConta: objConta.idPlataformaConta,
                        idProcessamentoOrigem: objOferta.idSincronizacao,
                        idSincronizacao: objConta.idSincronizacao,
                        tipoServico: objConta.tipoServico,
                        tipoInformacao: objConta.tipoInformacao,
                        idOrigem: objOferta.idOferta,
                        tpProcesso: 'E',
                        hasCode: objOferta.hascodeorigem,
                        dsErro: "Imagem nao encontrada"
                    }   
            
                    objListaPersistencia.push(objPost)
                }*/

        } catch (error) {
                console.log(error)
        }
    }

    const data = {
        create: insert,
        update: update,
        delete: remove
    }

    const urlWordPress = `${endPoint.urlServidorWordPress}/produtoBatch?url=${objConta.url}&consumerKey=${objConta.consumerKey}&consumerSecret=${objConta.consumerSecret}`
    let retornoWordPress: any = await axios.post(urlWordPress, data);
    retornoWordPress = retornoWordPress.data

    for (const key in retornoWordPress.create) {

        const objInsertWordPress = retornoWordPress.create[key];

        if(objInsertWordPress.id > 0 && isEmpty(objInsertWordPress.error)){


            const objSku = objInsertWordPress.sku.replace(/[^0-9]/g,'');
            let objOferta:any = listaCupons.filter(off => `${off.idOferta}` === `${objSku}`);

            objOferta = objOferta[0]  
            
            if(!isEmpty(objOferta)){

                const objPost = {
                    idPlataforma : objConta.idPlataforma,
                    idPlataformaConta: objConta.idPlataformaConta,
                    idProcessamentoOrigem: objOferta.idSincronizacao,
                    idSincronizacao: objConta.idSincronizacao,
                    tipoServico: objConta.tipoServico,
                    tipoInformacao: objConta.tipoInformacao,
                    idOrigem: objOferta.idOferta,
                    urlDestino: objInsertWordPress.permalink,
                    priceHtml: objInsertWordPress.price_html,
                    idDestino: objInsertWordPress.id,
                    tpProcesso: objOferta.situacao,
                    hasCode: objOferta.hascodeorigem,
                    thumbnailDestino: (isEmpty(objInsertWordPress.images) ? '' :objInsertWordPress.images[0].src),
                }
            
                objListaPersistencia.push(objPost)
            }
        }
    }

    for (const key in retornoWordPress.update) {

        const objUpdateWordPress = retornoWordPress.update[key];

        if(objUpdateWordPress.id > 0 && isEmpty(objUpdateWordPress.error)){

            const objSku = objUpdateWordPress.sku.replace(/[^0-9]/g,'');
            let objOferta:any = listaCupons.filter(off => `${off.idOferta}` === `${objSku}`);
            objOferta = objOferta[0]  
            
           const objPost = {
                    idPlataformaContaProcessado: objOferta.idPlataformaContaProcessado,
                    idPlataforma : objConta.idPlataforma,
                    idPlataformaConta: objConta.idPlataformaConta,
                    idProcessamentoOrigem: objOferta.idSincronizacao,
                    idSincronizacao: objConta.idSincronizacao,
                    tipoServico: objConta.tipoServico,
                    tipoInformacao: objConta.tipoInformacao,
                    idOrigem: objOferta.idOferta,
                    urlDestino: objUpdateWordPress.permalink,
                    priceHtml: objUpdateWordPress.price_html,
                    idDestino: objUpdateWordPress.id,
                    tpProcesso: objOferta.situacao,
                    hasCode: objOferta.hascodeorigem,
                    thumbnailDestino: (isEmpty(objUpdateWordPress.images) ? '' :objUpdateWordPress.images[0].src),
            }
        
            objListaPersistencia.push(objPost)
        }
    }

    if(!isEmpty(objListaPersistencia)){
        const url = `${endPoint.urlServidorDatabase}/persistProcessadoLista`
        await axios.post(url, objListaPersistencia);
    }

    console.log(`FINALIZOU PROCESSO DE SINCRONIZACAO DE OFERTA NUMERO ${objConta.sequenciaExecucao}`)

    return "OK";
    
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
    objProcessamento.url = objConta.url
    objProcessamento.consumerKey = objConta.consumerKey
    objProcessamento.consumerSecret = objConta.consumerSecret

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