/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export class CreateAppRoleInput {
    name: string;
    description?: Nullable<string>;
    permissionIds?: Nullable<number[]>;
}

export class UpdateAppRoleInput {
    name?: Nullable<string>;
    description?: Nullable<string>;
    permissionIds?: Nullable<number[]>;
}

export class AppPermission {
    id: number;
    name: string;
    description?: Nullable<string>;
    createdAt: string;
}

export abstract class IQuery {
    abstract permissions(): AppPermission[] | Promise<AppPermission[]>;

    abstract permission(id: string): Nullable<AppPermission> | Promise<Nullable<AppPermission>>;

    abstract appRoles(): AppRole[] | Promise<AppRole[]>;

    abstract appRole(id: number): AppRole | Promise<AppRole>;
}

export class AppRole {
    id: number;
    name: string;
    description?: Nullable<string>;
    permissions: AppPermission[];
    createdAt: string;
    updatedAt: string;
}

export abstract class IMutation {
    abstract createAppRole(input: CreateAppRoleInput): AppRole | Promise<AppRole>;

    abstract updateAppRole(id: number, input: UpdateAppRoleInput): AppRole | Promise<AppRole>;

    abstract deleteAppRole(id: number): boolean | Promise<boolean>;
}

type Nullable<T> = T | null;
