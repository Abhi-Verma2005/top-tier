"use client"
import React, { useState } from "react";
import axios from "axios";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import img2 from '@/images/signup.png'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

// Updated validation schema with GitHub username
const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email").refine(
    (email) => email.endsWith("@nst.rishihood.edu.in"),
    "Must use college email"
  ),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  enrollmentNum: z.string().min(1, "Enrollment number is required"),
  section: z.enum(['A', 'B', 'C', 'D', 'E']),
  githubUsername: z.string().min(1, "GitHub username is required")
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function Signup() {
  const Router = useRouter()
  const { data:session } = useSession()
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: email ?? '',
      password: "",
      enrollmentNum: "",
      section: undefined,
      githubUsername: ""
    }
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsSubmitting(true);
    try {
      const signupResponse = await axios.post("/api/auth/signup", data, {
        headers: { "Content-Type": "application/json" }
      });
      if (signupResponse.status !== 200) {
        toast.error("Failed to create account. Please try again.");
        return;
      }
      toast.success("Signup successful!");
      Router.push('/auth/signin');
    } catch (error) {
      console.error("Signup Error:", error);
      toast.error("An error occurred during signup");
    } finally {
      setIsSubmitting(false);
    }
  };

  if(session) {
    Router.push('/user/dashboard')
  }

  return (
    <div className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">

      <div className="flex min-h-screen p-4 md:p-10 relative z-10">
        
        <div className="flex flex-1 items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2 -skew-x-12 bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
                <UserPlus className="w-6 h-6 text-[#2a5d75]" />
                Join <span className="text-[#2a5d75]">TopTier.dev</span>
              </CardTitle>
              <CardDescription className="text-center text-gray-400">
                Create your account with your college credentials
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Username</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Choose a unique username" 
                            className="border-white/10 bg-white/5 text-white focus:border-[#2a5d75] focus:ring focus:ring-[#2a5d75] focus:ring-opacity-50"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">College Email</FormLabel>
                        <FormControl>
                          <Input
                            className="border-white/10 bg-white/5 text-gray-400 focus:border-[#2a5d75] focus:ring focus:ring-[#2a5d75] focus:ring-opacity-50"
                            {...field} 
                            disabled
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type={isPasswordVisible ? "text" : "password"}
                              placeholder="Strong password" 
                              className="border-white/10 bg-white/5 text-white focus:border-[#2a5d75] focus:ring focus:ring-[#2a5d75] focus:ring-opacity-50"
                              {...field} 
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                              onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                            >
                              {isPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="githubUsername"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">GitHub Username</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Your GitHub profile" 
                            className="border-white/10 bg-white/5 text-white focus:border-[#2a5d75] focus:ring focus:ring-[#2a5d75] focus:ring-opacity-50"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="enrollmentNum"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Enrollment Number</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="College ID" 
                              className="border-white/10 bg-white/5 text-white focus:border-[#2a5d75] focus:ring focus:ring-[#2a5d75] focus:ring-opacity-50"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="section"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Section</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="border-white/10 bg-white/5 text-white focus:border-[#2a5d75] focus:ring focus:ring-[#2a5d75] focus:ring-opacity-50">
                                <SelectValue placeholder="Select Section" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-black/90 border-white/10 text-white">
                              {['A', 'B', 'C', 'D', 'E'].map((sec) => (
                                <SelectItem key={sec} value={sec} className="hover:bg-white/10 focus:bg-white/10">
                                  Section {sec}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-[#2a5d75] hover:bg-[#1d4254] text-white font-medium"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creating Account..." : "Join TopTier.dev"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}