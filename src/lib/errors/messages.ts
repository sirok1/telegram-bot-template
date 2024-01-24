import { register } from '@/lib/errors/bot-error';

const Messages = {
    INVALID_OPTION: (prop: string, must: string) => `The ${prop} option must be ${must}`,
    FILE_NOT_FOUND: (file: any) => `File could not be found: ${file}`,
    SLASH_COMMAND_INVALID_NAME: 'The slash command object must contain the name',
    DATABASE_INVALID_URL: 'You should pass mongo url to create connection',
    HANDLERS_FACTORY_ERROR: (err: any) => `${err}`,
    LOGS_HANDLER_NAME_RESERVED: 'It is not possible to create an event with this name, this name has already been reserved'

};
for (const [name, message] of Object.entries(Messages)) register(name, message);