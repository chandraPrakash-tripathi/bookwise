import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { serve } from "@upstash/workflow/nextjs";
import { eq } from "drizzle-orm";
import { sendEmail } from "@/lib/workflow";

type UserState = "non-active" | "active";
type InitialData = {
  email: string;fullName: string;
};
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
const THREE_DAYS_IN_MS = 3 * ONE_DAY_IN_MS;
const THIRTY_DAYS_IN_MS = 30 * ONE_DAY_IN_MS;

//check lastactivity state and dervie the user state
const getUserState = async (email: string): Promise<UserState> => {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (user.length === 0) return "non-active";

  const lastActivityDate = new Date(user[0].lastActivityDate!);
  const now = new Date();
  const timeDifference = now.getTime() - lastActivityDate.getTime();

  if (
    timeDifference > THREE_DAYS_IN_MS &&
    timeDifference <= THIRTY_DAYS_IN_MS
  ) {
    return "non-active";
  }

  return "active";
};

export const { POST } = serve<InitialData>(async (context) => {
  const { email, fullName } = context.requestPayload;

  //start by sending a newly signed-up user a welcome email
  //this is a workflow that will be run in the background
  await context.run("new-signup", async () => {
    await sendEmail({
      email,
      subject: "Welcome to Bookwise!",
      message:`Welcome ${fullName} to Bookwise! We are excited to have you on board.`
    });
  });

  //Initial Waiting Period
  //To leave time for the user to interact with our platform, we use context.sleep to pause our workflow for 3 days:
  await context.sleep("wait-for-3-days", 60 * 60 * 24 * 3);

  //Periodic State Check
  //We enter an infinite loop to periodically (every month) check the user’s engagement level with our platform and send appropriate emails:
  while (true) {
    const state = await context.run("check-user-state", async () => {
      return await getUserState(email);
    });

    if (state === "non-active") {
      await context.run("send-email-non-active", async () => {
        await sendEmail({
          email,
          subject: "You've been inactive for a while",
          message: `Hi ${fullName}, we noticed you haven't been active for a while. We miss you! Come back and check out the latest features on Bookwise.`,
        });
      });
    } else if (state === "active") {
      await context.run("send-email-active", async () => {
        await sendEmail({
          email,
          message: `Hi ${fullName}, thanks for being an active user! We appreciate your engagement with Bookwise. If you have any feedback, feel free to reach out.`,
          subject: "Thanks for being an active user!",
        });
      });
    }

    await context.sleep("wait-for-1-month", 60 * 60 * 24 * 30);
  }
});
