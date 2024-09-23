// need add model to mongo index file
import BaseService from "@/utils/base/service";
import { GameHistory } from "@/utils/db";

import { IGameHistoryModal } from "./game-history.interface";

export class GameHistoryService extends BaseService<IGameHistoryModal> {
  constructor() {
    super(GameHistory);
  }
}
