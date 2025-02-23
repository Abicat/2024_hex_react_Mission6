import { useNavigate } from "react-router-dom"

export default function NotFoundPage(){
    const navigate = useNavigate();

    return (
        <div>
            <h2>此頁面不存在</h2>
            <button type="button" className="btn btn-primary" onClick={()=>{navigate('/')}}>回首頁</button>
        </div>
    )
}