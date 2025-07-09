import './NotFoundPage.css'
import {FaExclamationTriangle} from 'react-icons/fa'
import {useLocation} from "react-router-dom";

export default function NotFoundPage() {
    let loc = useLocation();

    return <>
    <div className='centered-404-page'>
        <FaExclamationTriangle
            // style={{top: "49%"}}
            size={240}/>
        <span>404</span>
    </div>
    <div className='font-semibold'>{`Page not found: ${loc.pathname}`}</div>
    </>;
}