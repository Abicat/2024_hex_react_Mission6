import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Toast from "../components/common/Toast";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function AdminLogin() {
  const navigate = useNavigate();

  const [account, setAccout] = useState({
    username: "",
    password: "",
  });

  const hasNavigated = useRef(false); // 防止重複導向

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${BASE_URL}/v2/admin/signin`, account);
      const { token, expired } = res.data;
      document.cookie = `myToken=${token}; expires=${new Date(expired)}`;
      // 設定 Authorization header
      axios.defaults.headers.common["Authorization"] = token;
      // setIsAuth(true);
      checkUserLogin(); // 登入成功後立即檢查
    } catch (error) {
      alert("登入失敗");
    }
  };

  const handleInputChange = (e) => {
    const { value, name } = e.target;
    setAccout({
      ...account,
      [name]: value,
    });
  };

  const checkUserLogin = async () => {
    const token = document.cookie.replace(
      /(?:(?:^|.*;\s*)myToken\s*\=\s*([^;]*).*$)|^.*$/,
      "$1"
    );

    if (!token) {
      // console.log("未找到 token，重新導向登入頁面");
      if (!hasNavigated.current) {
        hasNavigated.current = true;
        navigate("/adminLogin");
      }
      return;
    }

    axios.defaults.headers.common["Authorization"] = token;

    try {
      await axios.post(`${BASE_URL}/v2/api/user/check`);
      Toast.fire({
        icon: "success",
        title: "驗證成功！",
      });
      navigate("/admin");
    } catch (error) {
      console.error("驗證失敗，請重新登入", error);
      // 清除 cookie
      document.cookie =
        "myToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      // 移除 axios 的 Authorization 預設標頭
      delete axios.defaults.headers.common["Authorization"];
      // 重新導向到登入頁面
      if (!hasNavigated.current) {
        hasNavigated.current = true;
        navigate("/adminLogin");
      }
    }
  };

  useEffect(() => {
    checkUserLogin();
  }, []);

  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100">
      <div style={{ width: "100%", maxWidth: "300px" }}>
        <h1 className="mb-5">管理員登入</h1>
        <form onSubmit={handleLogin} className="d-flex flex-column gap-3">
          <div className="form-floating mb-3">
            <input
              id="username"
              name="username"
              type="email"
              value={account.username}
              onChange={handleInputChange}
              className="form-control"
              placeholder="name@example.com"
            />
            <label htmlFor="username">Email address</label>
          </div>
          <div className="form-floating">
            <input
              id="password"
              name="password"
              type="password"
              value={account.password}
              onChange={handleInputChange}
              className="form-control"
              placeholder="Password"
            />
            <label htmlFor="password">Password</label>
          </div>
          <button className="btn btn-primary">登入</button>
        </form>
        <button
          type="button"
          className="btn btn btn-outline-primary mt-2"
          onClick={() => {
            navigate("/");
          }}
        >
          返回商品首頁
        </button>
        <p className="mt-3 mb-3 text-muted text-center">
          &copy; 2024~∞ - 六角學院
        </p>
      </div>
    </div>
  );
}
