import { Context } from 'hono'
import { readdir } from "node:fs/promises";
import { BookStruct } from '../types';
import { parse, stringify } from 'smol-toml'
import { v4 as uuidv4 } from 'uuid';
import { bookshelf_upload } from '../lib/db';

const BOOKSHELF_PATH = "./src/test/bookshelf"

export async function book_listup(c: Context) {
    const bookshelf = await readdir(BOOKSHELF_PATH);
    let books: Array<BookStruct> = []

    // db에 하드클론 하기로 했으니, 디비준비되면 바꾸기, 이건 진짜 너무 비효율임 ㅇㅇ... 
    // forEach좀 그만써
    for (const book of bookshelf) {
        const book_text = await Bun.file(`${BOOKSHELF_PATH}/${book}`).text()
        const book_toml = parse(book_text)

        console.log(book_toml["starting_point"])
        books.push({
            id: book_toml["book"].id,
            title: book_toml["cover"].title,
            desc: book_toml["cover"].desc,
            starting: book_toml["entry"].starting
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

    switch (type) {
        case "toml":
            const rawToml = Bun.file(await file!.arrayBuffer())
            const book_toml = parse(`${rawToml}`)
            let book = {
                id: book_toml["book"].id,
                title: book_toml["cover"].title,
                desc: book_toml["cover"].desc,
                system: book_toml["prompt"].system
            }
            await bookshelf_upload(book)
            break;
        default:
            break;
    }

    // let save = await Bun.write(`./src/test/bookshelf/${file.name}`, await file!.arrayBuffer());
    console.log()

    return c.json({ message: "OK", type, files: !!file }, 200)
}

export async function book_unfolds(c: Context) {
    const { book_id, starting_point } = await c.req.json()
    // 업로드하면 내용 하드클론 해서 디비에 넣고, 그거기반으로 ID를 생성해서 해야함, 잉크웰 스튜디오에서도 ID를 랜덤생성하게 하자



    return c.json({
        table_id: uuidv4()
    })
}