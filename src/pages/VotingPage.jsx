import { useParams } from "react-router-dom";

export default function VotingPage() {
    const { id } = useParams();

    return (
        <div className="flex justify-evenly items-stretch h-screen">
            <div className="flex-1 m-20 bg-secondary rounded-xl shadow-lg">
            {/*    CANDIDATES LIST*/}

            {/*BOTTOM BOX */}
            {/*    LIST OF CHOSEN CANDIDATES*/}
            {/*    SUBMIT BUTTON*/}
            </div>
            <div className="flex-1 m-20 bg-secondary rounded-xl shadow-lg">f</div>
        </div>
    );
}