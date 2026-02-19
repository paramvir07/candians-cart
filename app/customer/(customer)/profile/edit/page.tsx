import { getUser } from '@/actions/customer/User.action'
import Navbar from '@/components/customer/landing/Navbar'
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Link } from 'lucide-react';

const page = async() => {
    const UserData = await getUser();
  return (
    <div>
        <Navbar/>
        <Card className='m-2'>
  <CardHeader>
    <CardTitle>Create an Account</CardTitle>
    <CardDescription>
      Enter your information below to create your account
    </CardDescription>
  </CardHeader>

  <CardContent>
    <form> 
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">Full Name *</FieldLabel>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="John Doe"
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="email">Email *</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Password *</FieldLabel>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type="password"
              pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}"
              required
            />
          </div>
          <FieldDescription>
            Must be at least 8 characters, include uppercase, lowercase,
            number, and special character.
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="address">Address *</FieldLabel>
          <Input
            id="address"
            name="address"
            type="text"
            placeholder="123 Main St"
            required
          />
        </Field>

        <Field>
          <div className="flex gap-3">
            <div className="flex-1">
              <FieldLabel htmlFor="city">City *</FieldLabel>
              <Input
                id="city"
                name="city"
                type="text"
                placeholder="e.g., Abbotsford"
                required
              />
            </div>

            <div className="flex-1">
              <FieldLabel htmlFor="province">Province *</FieldLabel>
              <Input
                id="province"
                name="province"
                type="text"
                placeholder="e.g., BC"
                required
              />
            </div>
          </div>
        </Field>

        <Field>
          <FieldLabel htmlFor="mobile">Mobile Number *</FieldLabel>
          <Input
            id="mobile"
            name="mobile"
            type="tel"
            placeholder="5551234567"
            pattern="[0-9]{10}"
            maxLength={10}
            required
          />
        </Field>

        <Field>
          <Button type="submit" className="w-full">
            Create Account
          </Button>

          <Button
            variant="outline"
            type="button"
            className="w-full mt-3"
          >
            Sign up with Google
          </Button>

          <FieldDescription className="px-6 text-center mt-3">
            Already have an account?{" "}
            <Link href="/customer/login">Sign in</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  </CardContent>
</Card>

    </div>
  )
}

export default page