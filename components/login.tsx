import { useForm } from 'react-hook-form';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';

type LoginData = {
  username: string;
  password: string;
}


const LOGIN = gql`
  mutation Login($loginInput: LoginInput!) {
    login(loginInput: $loginInput) {
      access_token
    }
  }
`

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginData>();
  const [login, { loading, error }] = useMutation(LOGIN);

  async function handleLogin(data: LoginData) {
    try {
      console.log('Sending data:', data); // Debug log
      const response = await login({
        variables: {
          loginInput: data
        }
      });

      const token = response.data.login.access_token;
      console.log('Login successfully', token);
    } catch (err) {
      console.error('Login error:', err);
    }
  }

  return (
    <form onSubmit={handleSubmit(handleLogin)}> {/* Remove the arrow function here */}
      <input
        type="text"
        placeholder="Username"
        {...register("username", { required: true })}
      />
      <input
        type="password"
        placeholder="Password"
        {...register("password", { required: true })}
      />
      {errors.username && <span>Username is required</span>}
      {errors.password && <span>Password is required</span>}
      {error && <span>Error: {error.message}</span>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      {loading && <p>loading...</p>}
    </form>
  );
}