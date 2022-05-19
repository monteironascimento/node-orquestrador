import axios from 'axios';
import { tipoServicoEnum } from '../enum/TipoServicoEnum';
export const ExecEmail = async (lsEntrada: any) => {
    console.log(`Executou rotina ${tipoServicoEnum.EMAIL.toString()}`)
    return "OK";
}