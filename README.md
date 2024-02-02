Authentication Guard for NestJS using supabase. When applied to a route, checks that an auth bearer JWT is in the request headers, checks that the token was created by your Supabase instance, and adds the decoded Supabase User object to the request for further actions.

## Installation

```shell
npm i nest-supabase-guard
```

## Usage

Import and use the Guard like you would any other.

On individual routes:

```typescript
import { SupabaseAuthGuard } from "nest-supabase-guard";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @UseGuards(SupabaseAuthGuard)
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
```

The Guard will take the resulting Supabase User of a successfully authenticated request and add it to the request object, as `request.authUser`, for later use.

## Prerequisites

1. The package expects you to have these environment variables set:

```
SUPABASE_URL=yourSupabaseUrl
SUPABASE_ANON_KEY=yourSupabaseAnonKey
```

2.  Routes protected by this guard should expect the request to have an authentication header with a bearer token, where the bearer token is the supabase-generated token for the requesting user.

    For example, your frontend might make a request that looks something like:

    ```typescript
    const session = await supabase.auth.getSession();
    axios.get("https://yourbackend.com/your-endpoint", {
      headers: {
        Authorization: `Bearer ${session.data.session.access_token}`,
      },
    });
    ```

## Optional Configuration

### Use your own Supabase client object

By default, the Guard will create an instance of a Supabase client behind the scenes. If you are already using a Supabase client and want to avoid having more than one, you can have the guard use yours.

Pass your Supabase client into the `customSupabaseClientProvider(supabaseClient)` helper, and add the result to your list of providers:

```typescript
import { customSupabaseClientProvider } from "nest-supabase-guard";

const supabaseClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, customSupabaseClientProvider(supabaseClient)],
})
export class AppModule {}
```
