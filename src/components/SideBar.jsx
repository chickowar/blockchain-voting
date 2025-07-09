import './SideBar.css'
import {FaPlus, FaVoteYea, FaUser} from 'react-icons/fa'

function SideBarIcon(){
    return (
<>

</>
    )
}

export default function SideBar(){

    return (
<>
    <div className="flex flex-col justify-evenly
    top-0 left-0
    h-screen w-1/6 m-0
    shadow-lg bg-background-2
    ">

        <div className='sidebar-icon'><FaPlus size={60}/></div>
        <div className='sidebar-icon'><FaUser size={60}/></div>
        <div className='sidebar-icon'><FaVoteYea size={60}/></div>

    </div>
</>
    )
}