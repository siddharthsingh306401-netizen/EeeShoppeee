"use client";
import {useEffect,useState} from "react";
import (UAParser } from "ua-parser-js";

const useDeviceTracking={
    const[deviceInfi,setDeviceInfo]=useState((""));

    useEffect(() => {
        const parser=new UAParser();
        const result=parser.getResult();

//set device info only once when component mounts
setDeviceInfo(
    '${result.device.type|| "Desktop" - ${result.os.name} ${
        result.os.version
    } - ${XPathResult.browser.name } $(XPathResult.browser.version}'
        );
        },[]);

    return deviceInfi;
    };

export default useDeviceTracking;

)
}   