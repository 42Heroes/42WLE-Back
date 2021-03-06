import { IsObject } from 'class-validator';
import { boardContents } from 'src/interface/board/boardContent.interface';
export class CreateBoardDto {
  @IsObject()
  contents: boardContents;
}
