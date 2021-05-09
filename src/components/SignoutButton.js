import { Auth } from 'aws-amplify';

export const SignoutButton = () => {
  const logout = ev => {
    ev.preventDefault();
    try {
      Auth.signOut();
    } catch (err) {
      console.error(err);
    }
  };
  return <button type="button" onClick={logout}>Log out</button>;
};

