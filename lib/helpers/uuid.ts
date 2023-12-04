import { UUID } from "crypto";
import { validate, version, v4 as uuidv4 } from "uuid";

export function isValidUUIDV4(uuid: UUID): uuid is UUID {
    return validate(uuid) && version(uuid) === 4;
}

export function generateUUIDV4(): string {
    return uuidv4();
}
