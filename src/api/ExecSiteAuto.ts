import axios from 'axios';
import { endPointDesEnum, endPointProdEnum } from '../enum/EndPointEnum';
import { isEmpty } from '../tools/Empty';

const endPoint = (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test' ? endPointProdEnum : endPointDesEnum)

export const ExecSiteAuto = async (objConta: any) => {
  
return { status : 200};
}
