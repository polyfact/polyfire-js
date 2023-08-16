import { UUID } from "crypto";
import { validate, version } from "uuid";

export function isValidUUIDV4(uuid: UUID): uuid is UUID {
    return validate(uuid) && version(uuid) === 4;
}
