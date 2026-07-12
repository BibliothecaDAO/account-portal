import type { DelegateProfileInput } from "@/lib/governance/delegate-input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  DELEGATE_INTERESTS,
  DelegateProfileInputSchema,
} from "@/lib/governance/delegate-input";
import { authClient } from "@/utils/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Login } from "./sign-in-with-starknet";

interface EditProfileFormProps {
  delegate?: {
    delegateProfile: {
      statement: string;
      interests?: string[];
      twitter: string;
      github: string;
      telegram: string;
      discord: string;
    };
  };
  isSubmitting?: boolean;
  onSubmit: (
    data: DelegateProfileInput & { interests: string[] },
  ) => Promise<void> | void;
}
export function DelegateProfileForm({
  delegate,
  isSubmitting = false,
  onSubmit,
}: EditProfileFormProps) {
  const form = useForm<DelegateProfileInput>({
    resolver: zodResolver(DelegateProfileInputSchema),
    defaultValues: {
      statement: delegate?.delegateProfile.statement ?? "",
      interests: delegate?.delegateProfile.interests ?? [],
      twitter: delegate?.delegateProfile.twitter ?? "",
      github: delegate?.delegateProfile.github ?? "",
      telegram: delegate?.delegateProfile.telegram ?? "",
      discord: delegate?.delegateProfile.discord ?? "",
    },
  });

  function handleFormSubmit(data: DelegateProfileInput) {
    return onSubmit({ ...data, interests: data.interests ?? [] });
  }
  const { data: session } = authClient.useSession();
  const isDisabled = !session || isSubmitting;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-8"
      >
        <FormField
          disabled={isDisabled}
          control={form.control}
          name="statement"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Statement</FormLabel>
              <FormControl>
                <Textarea placeholder="Your statement..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          disabled={isDisabled}
          control={form.control}
          name="interests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Interests</FormLabel>
              <FormControl>
                <ToggleGroup
                  {...field}
                  onValueChange={field.onChange}
                  type="multiple"
                  variant="outline"
                  size="sm"
                  className="grid grid-cols-2 justify-start sm:grid-cols-4 lg:grid-cols-6"
                >
                  {DELEGATE_INTERESTS.map(({ value, label }) => (
                    <ToggleGroupItem
                      className="leading-none"
                      key={value}
                      value={value}
                    >
                      {label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            disabled={isDisabled}
            control={form.control}
            name="twitter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Twitter</FormLabel>
                <FormControl>
                  <Input placeholder="Your Twitter handle" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            disabled={isDisabled}
            control={form.control}
            name="github"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Github</FormLabel>
                <FormControl>
                  <Input placeholder="Your Github username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            disabled={isDisabled}
            control={form.control}
            name="telegram"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telegram</FormLabel>
                <FormControl>
                  <Input placeholder="Your Telegram handle" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            disabled={isDisabled}
            control={form.control}
            name="discord"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discord</FormLabel>
                <FormControl>
                  <Input placeholder="Your Discord username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {!session ? (
          <Login />
        ) : (
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Saving Profile…" : "Save Profile"}
          </Button>
        )}
      </form>
    </Form>
  );
}
