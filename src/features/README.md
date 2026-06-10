# Feature-Sliced Design (FSD) Architecture

The `features` directory contains the business logic features of the application. Each subdirectory inside represents a Feature (e.g., `auth`, `dashboard`, `user`).

To keep the codebase maintainable as it scales, each Feature should adhere to the following folder structure:

```text
features/feature_name/
├── api/          # API call functions (e.g., login, register, fetchUser)
├── components/   # UI Components specific to this feature
├── hooks/        # Custom React hooks (e.g., useLogin, useUserStatus)
├── types/        # TypeScript types/interfaces specific to this feature
└── utils/        # Helper functions, formatters used internally by the feature
```

## Important Rules

1. **Isolation:** Components in `features/auth` must not import logic from `features/dashboard`. If there is shared logic, move it to the `src/shared/` directory.
2. **No Shared UI Components:** Do not place globally shared UI components like `Button`, `Input`, `Modal` in this directory. Place them in `src/shared/ui/`.
3. **Domain-Driven Grouping:** Do not put all project Types into a single `types.ts` file. Keep feature-specific types in the `types/` folder of that feature.
