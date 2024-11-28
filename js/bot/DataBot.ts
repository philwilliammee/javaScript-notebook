import { BaseService } from './base.service';
import { SYSTEM_CONFIG_MESSAGE } from './DataBot.bot';

export class DataBotService extends BaseService {
  SYSTEM_CONFIG_MESSAGE = SYSTEM_CONFIG_MESSAGE;

  async boot(): Promise<void> {
    await this.initializeChatContext();
  }

  getChatMessages() {
    return this.chatContext;
  }
}
