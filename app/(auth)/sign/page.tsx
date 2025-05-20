"use client";

import React, { useRef, useState } from "react";
import SignatureCanvas from "@uiw/react-signature";

function SignaturePad() {
    const sign = useRef<any>(null);  
    const [url, setUrl] = useState('');

    const handleClear = () => {
        sign.current?.clear();
        setUrl('');
    };

    const handleGenerate = () => {
        const trimmed = sign.current?.getTrimmedCanvas().toDataURL('image/png');
        if (trimmed) {
            setUrl(trimmed);
        }
    };

    return (
        <div>
            <div style={{ border: "2px solid black", width: 500, height: 200 }}>
                <SignatureCanvas
                    width={500}
                    height={200}
                    className="sigCanvas"
                    ref={sign}
                />
            </div>

            <br />
            <button style={{ height: "30px", width: "60px" }} onClick={handleClear}>Clear</button>
            <button style={{ height: "30px", width: "60px" }} onClick={handleGenerate}>Save</button>

            <br /><br />
            {url && <img src={url} alt="signature preview" />}
        </div>
    );
}

export default SignaturePad;
