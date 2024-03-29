import { useRecoilValue } from "recoil";
import authScreenAtom from "../../recoil-atoms/auth-atom";
import Login from "../../components/login/Login";
import Register from "../../components/register/Register";
import { AuthScreen } from "../../shared/enums/AuthScreens";

const AuthPage = () => {
  const authScreenState = useRecoilValue(authScreenAtom);

  return <>{authScreenState === AuthScreen.LOGIN ? <Login /> : <Register />}</>;
};

export default AuthPage;
