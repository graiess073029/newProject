import { createHWiNFOReader, HWiNFOSnapshot } from "hwinfo-reader"


const reader = createHWiNFOReader();


export const sharedMemReader = async () : Promise<HWiNFOSnapshot | null> =>  {

    try{
        const data = reader.read();
        return data;
    }
    catch(err) {
        console.log(err);
        return null;
    }
}