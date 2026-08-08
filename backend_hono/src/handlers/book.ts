import { forEachBail } from 'enhanced-resolve';
import { Hono } from 'hono'
import { Context } from 'hono'
import { readdir } from "node:fs/promises";
import { BookStruct } from '../types';
import { load } from 'js-toml';

const BOOKSHELF_PATH = "./src/test/bookshelf"



export async function book_listup(c: Context) {
    const bookshelf = await readdir(BOOKSHELF_PATH);
    let books: Array<BookStruct> = []

    // forEach좀 그만써
    for (const book of bookshelf) {
        const book_text = await Bun.file(`${BOOKSHELF_PATH}/${book}`).text()
        const book_toml = load(book_text)
        books.push({
            id: "1",
            title: book_toml["title"],
            desc: book_toml.desc,
            starting_point: []
        })
    }
    console.log(books)
    return c.json(books)
}

// 나중에 zod로 검증하는 과정을 거쳐야함
export async function book_upload(c: Context) {
    const body = await c.req.parseBody();
    
    const type = body.type as string;

    const file = body.files as File


    console.log('[book_upload] type:', type);
    console.log('[book_upload] files:', file);
    console.log('[book_upload] body keys:', Object.keys(body));

    let save = await Bun.write(`./src/test/bookshelf/${file.name}`, await file!.arrayBuffer());
    console.log(save)

    return c.json({ message: "OK", type, files: !!file }, 200)
}