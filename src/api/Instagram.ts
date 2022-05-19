import axios from 'axios';
import fs from 'fs';
import request from 'request';
import { tipoServicoEnum } from '../enum/TipoServicoEnum';
import { endPointDesEnum , endPointProdEnum} from '../enum/EndPointEnum';
import { isEmpty } from '../tools/Empty';
import { removeAcento } from '../tools/NormalizarString';
import Jimp from 'jimp';

const endPoint = (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test' ? endPointProdEnum : endPointDesEnum)

export const ExecInstagram = async (objConta: any) => {

  try {
    
    console.log(`Executou rotina ${tipoServicoEnum.INSTAGRAM.toString()}`)

    const url = `${endPoint.urlServidorDatabase}/findPenpDivulgacao`
    //objConta.username = 'ofertabest_oficial'
    //objConta.tipoServiceDestino = tipoServicoEnum.INSTAGRAM
   
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
        fixado: true,
      }  
    })

    if(isEmpty(objPostagem.data)){
      objPostagem = await axios.post(url, objConta,{
        params: {
          limit: 10,
          offset: 0,
          destaque: true,
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
    
    const obj = objPostagem.data[Math.floor(Math.random() * objPostagem.data.length)]
    
    const constObjConta = {
        username: objConta.username,
        password: objConta.password,
        tags: `#ofertabest #parceiro${removeAcento(obj.nomeloja)} #${removeAcento(obj.nomecategoria)} #oferta #cupon #topoferta #ofertahoje #ofertadodia`,
        descricaoPost: `${obj.tipoorigem === 'C' ? 
                            `Cupon ${obj.descricao}`: 
                            `${obj.descricao}  ${(obj.precototal > obj.preco ? `💲 De: ${obj.precototal}   ` : '')}💰 Por: ${obj.preco}   `}`,
        //urlImageDest: process.env.NODE_ENV === 'production' ? '/root/developer/ofertabest/node-instagram/imagens/Temp' : './../node-instagram/imagens/Temp',
        urlImageDest: './../node-instagram/imagens/Temp',
        urlImageOrig: obj.thumbnail,
        tpPostagem: 'feed',
        nameImage: `${new Date().getTime()}.jpg`
    };

    const downloadName = function (uri, filename, callback) {
      request.head(uri, function (err, res, body) {
        try {
          console.log(`EFETUANDO DOWLOAD`);
          request(uri).pipe(fs.createWriteStream(filename)).on('close', async function () {

            try {

              let urlImagemNova = await editarImagem(`${constObjConta.urlImageDest}`, `${constObjConta.nameImage}`, 'feed',obj.preco, obj.descricao);
              
              await axios({
                method: 'post',
                url: `${endPoint.urlServidorInstagramOferta}/gerarPostInstragram`,
                data: {
                  "username": objConta.username,
                  "password": objConta.password,
                  "tags": constObjConta.tags,
                  "description": constObjConta.descricaoPost,
                  "dirImagem": `${constObjConta.urlImageDest}/${urlImagemNova}`,
                  "dirAbsoluto": `${constObjConta.urlImageDest}`,
                  "nameImagem": urlImagemNova,
                  "tpPostagem": 'feed',
                  "token": "KAHDHA(S(&#&@)#(9234"
                }
              });

              sleep(10000);

              urlImagemNova = await editarImagem(`${constObjConta.urlImageDest}`, `${constObjConta.nameImage}`, 'feed',obj.preco, obj.descricao);
              
              await axios({
                method: 'post',
                url: `${endPoint.urlServidorInstagramOferta}/gerarPostInstragram`,
                data: {
                  "username": objConta.username,
                  "password": objConta.password,
                  "tags": constObjConta.tags,
                  "description": constObjConta.descricaoPost,
                  "dirImagem": `${constObjConta.urlImageDest}/${urlImagemNova}`,
                  "dirAbsoluto": `${constObjConta.urlImageDest}`,
                  "nameImagem": urlImagemNova,
                  "tpPostagem": 'story',
                  "token": "KAHDHA(S(&#&@)#(9234"
                }
              });

              efetivarProcessado(objConta, obj);

            } catch (error) {
            }

          });

          
        } catch (error) {
          console.log(error);
        }
      });
    };

    downloadName(constObjConta.urlImageOrig, `${constObjConta.urlImageDest}/${constObjConta.nameImage}`, function(){

    });

  } catch (error) {
      
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
      tipoInformacao: tipoServicoEnum.INSTAGRAM,
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


function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
} 

async function editarImagem(urlOrigem, nmOrigem,resolucao, valor, descricao){

  const urlCompleta = `${urlOrigem}/${nmOrigem}`
  const urlCompletaAlterada = `alterado_${nmOrigem}`
  try {

      console.log(urlCompleta)
      let imagemLogo = await Jimp.read(`${urlOrigem}/${resolucao === 'feed' ? 'base': 'baseStory'}.png`)
      console.log(imagemLogo)

      //Quadrado (1:1) – 1080×1080
      //Vertical (3:4) – 810×1080

      imagemLogo = await imagemLogo.resize(150, 150)
                    .quality(100)
                    .getBase64(Jimp.MIME_PNG, () => {});

      let imgBase = new Jimp(720, 720);

      let imagemProduto = await Jimp.read(urlCompleta)
      console.log(imagemProduto)
      imagemProduto = await imagemProduto.resize( 720, Jimp.AUTO)
                    .quality(100)
                    .getBase64(Jimp.MIME_PNG, () => {});

      imgBase.composite(imagemProduto, 0, 0, {
        mode: Jimp.BLEND_SOURCE_OVER,
        opacitySource: 10,
        opacityDest: 10
      });

      imgBase.composite(imagemLogo, (720 - 710), (720-200), {
        mode: Jimp.BLEND_SOURCE_OVER,
        opacitySource: 0.9,
        opacityDest: 0.9
      });

      let imagemDestaquePreco = await Jimp.read(`${urlOrigem}/base_preco_destaque.png`)

      imagemDestaquePreco = imagemDestaquePreco.resize( 250, Jimp.AUTO)
       
      imgBase.composite(imagemDestaquePreco, (720 - 250), (720-710), {
        mode: Jimp.BLEND_SOURCE_OVER,
        opacitySource: 0.9,
        opacityDest: 0.9
      });

      const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
      console.log("FONTE")

      imgBase.print(font, (720 - 220), (720-595), `R$: ${valor}`)

      let imagemBio = await Jimp.read(`${urlOrigem}/base_bio.png`)
      imagemBio = await imagemBio.resize( 250, 250)
                    .quality(100)
                    .getBase64(Jimp.MIME_PNG, () => {});

      imgBase.composite(imagemBio, 5, 5, {
                      mode: Jimp.BLEND_SOURCE_OVER,
                      opacitySource: 10,
                      opacityDest: 10
                    });
     
      const fontBlack = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
      
              
      imgBase.print(fontBlack, (720 - 350), (720-60), descricao)

      console.log("PERSISTINDO")

      imgBase.write(`${urlOrigem}/${urlCompletaAlterada}`);
      console.log("FINALIZANDO")

    } catch (error) {
       console.log(error) 
    }

  return urlCompletaAlterada;
}