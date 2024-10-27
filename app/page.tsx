'use client'

import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useForm } from 'react-hook-form';
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod';
import { gql, useMutation } from '@apollo/client'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { loginStart, loginSuccess, loginFailure } from '@/lib/store/slice/authSlice';
import { Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const LOGIN = gql`
  mutation Login($loginInput: LoginInput!) {
    login(loginInput: $loginInput) {
      access_token
      user {
        id
        username
        email
        displayName
      }
    }
  }
`

const formSchema = z.object({
  username: z.string()
    .min(6, { message: 'Username must be at least 6 characters' })
    .max(20, { message: 'Username cannot exceed 20 characters' }),
  password: z.string()
    .min(4, { message: 'Password must be at least 4 characters' })
    .max(100, { message: 'Password cannot exceed 100 characters' })
})

export default function Page() {
  const dispatch = useAppDispatch();
  const router = useRouter()
  const { isLoading, error } = useAppSelector(state => state.auth)
  const [login] = useMutation(LOGIN);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    }
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      dispatch(loginStart())

      const { data } = await login({
        variables: {
          loginInput: {
            username: values.username,
            password: values.password,
          }
        }
      })

      if (data?.login) {
        dispatch(loginSuccess({
          access_token: data.login.access_token,
          user: data.login.user,
        }))
        router.push('/dashboard');
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Please enter your credentials to access</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent>
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type='password' placeholder="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">Login</Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}