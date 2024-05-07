import refreshLogo from "./media/repeat.svg";
import React, {useEffect} from "react";

export default function Footer({uuid, getNewUuid})
{

    return(
        <div className="uuidFooter">
            <p>
                Session ID: {uuid || "API Error!"}
                <img className={"icon-reload"} alt="refresh" src={refreshLogo} onClick={getNewUuid}/>
            </p>
        </div>
    )
}
    