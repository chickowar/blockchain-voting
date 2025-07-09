import './SideBar.css'
import {FaPlus, FaVoteYea, FaUser} from 'react-icons/fa'
import {useNavigate} from "react-router-dom";

function SideBarIcon(){
    return (
<>

</>
    )
}

export default function SideBar(){
    let navigate = useNavigate();
    return (
<>
    <div className="flex flex-col justify-evenly
    top-0 left-0
    h-screen w-1/12  m-0
    shadow-lg bg-background-light overflow-clip
    ">

        <div className='sidebar-icon' onClick={()=>{navigate('/1')}}><FaPlus size={60}/></div>
        <div className='sidebar-icon' onClick={()=>{navigate('/login')}}><FaUser size={60}/></div>
        <div className='sidebar-icon' onClick={()=>{navigate('/vote/1')}}><FaVoteYea size={60}/></div>

    </div>
</>
    )
}