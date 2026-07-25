import { TableData } from "@app/components/shared/basetable/basetable-types";

export class User extends TableData {
    email!: string;
    password!: string;
    name!: string;
    token!: string;
    role!: string;
    last_login!: Date;
}

export class Package {
    name?: string;
    version?: string;
    main?: string;
    license?: string;
    description?: string;
    keywords?: string[];
    author?: string;
    dependencies? : Map<string,string>[]
}