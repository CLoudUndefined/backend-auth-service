
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export class AppPermission {
    id: number;
    name: string;
    description?: Nullable<string>;
    createdAt: string;
}

export abstract class IQuery {
    abstract permissions(): AppPermission[] | Promise<AppPermission[]>;

    abstract permission(id: string): Nullable<AppPermission> | Promise<Nullable<AppPermission>>;
}

type Nullable<T> = T | null;
