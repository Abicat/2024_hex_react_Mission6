import { NavLink, Outlet, useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function AdminLayout() {
  const navigate = useNavigate(); // 用於導航

  const handleLogout = async () => {
    try {
      await axios.post(`${BASE_URL}/v2/logout`);
      console.log("登出成功");
      navigate("/");
    } catch (error) {
      console.error("登出失敗");
      alert("登出失敗，請稍後再試！");
    } 
  };

  return (
    <>
      <div className="container-fluid d-flex">
        <nav className="navbar navbar-expand-lg bg-body-tertiary">
          <div className="container-fluid flex-column justify-content-start">
            <NavLink to="/admin/orders" className="nav-link fs-2">
              LOGO
            </NavLink>

            <div
              className="collapse navbar-collapse"
              id="navbarSupportedContent"
            >
              <ul className="navbar-nav me-auto mb-2 mb-lg-0 flex-column justify-content-start">
                <li className="nav-item">
                  <NavLink to="/admin/products" className="nav-link">
                    商品管理
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/admin/orders" className="nav-link">
                    訂單管理
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/" className="nav-link">
                    返回前台
                  </NavLink>
                </li>
                <li className="nav-item ">
                  <button
                    type="button"
                    className="btn btn-dark"
                    onClick={handleLogout}
                  >
                    登出系統
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </nav>
        <div>
          <Outlet />
        </div>
      </div>
    </>
  );
}
