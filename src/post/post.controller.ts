import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  findAll() {
    return this.postService.findAll();
  }

  @Post()
  createPost(@Body() createPostDto: CreatePostDto) {
    return this.postService.create(createPostDto);
  }

  @Put(':id')
  updatePost(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postService.update(+id, updatePostDto);
  }

  @Delete(':id')
  deletePost(@Param('id') id: string) {
    return this.postService.remove(+id);
  }

  @Get(':id/comment')
  getComment(@Param('id') id: string) {
    return this.postService.findAll();
  }

  @Post(':id/comment')
  createComment(@Param('id') id: string) {
    return ;
  }

  @Put(':id/comment')
  updateComment(@Param('id') id: string) {
    return ;
  }

  @Delete(':id/comment')
  deleteComment(@Param('id') id: string) {
    return ;
  }

  @Patch(':id/save')
  savePost(@Param('id') id: string) {
    return ;
  }

  @Patch(':id/like')
  likePost(@Param('id') id: string) {
    return ;
  }

  @Patch(":id/comment/like")
  likeComment(@Param('id') id: string) {
    return ;
  }
  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.postService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
  //   return this.postService.update(+id, updatePostDto);
  // }
}